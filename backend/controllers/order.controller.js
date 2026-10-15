import { Order } from "../models/mongo/order.model.js";
import { Product } from "../models/mongo/product.model.js";
import { Payment } from "../models/mongo/payment.model.js";
import mongoose from "mongoose";
import stripe from "../config/stripe.js";
import { createOrderFromCart } from "../services/order.service.js";
import { validateShippingAddress } from "../utils/validateShippingAddress.js";

// Minor unit representation: 5000 paise = ₹50.00
const SHIPPING_COST_PAISE = 5000;

/**
 * 1. PLACE COD ORDER
 */
export const order = async (req, res) => {
  const userId = req.user?.id;
  const { shippingAddress, checkoutAttemptId } = req.body;

  if (!userId) {
    return res.status(401).json({ message: "Authentication required." });
  }

  const validationError = validateShippingAddress(shippingAddress);
  if (validationError) {
    return res.status(400).json({ message: validationError });
  }

  if (
    typeof checkoutAttemptId !== "string" ||
    checkoutAttemptId.trim().length === 0
  ) {
    return res.status(400).json({
      message: "A valid checkout attempt ID is required.",
    });
  }

  let createdOrder;

  try {
    const session = await mongoose.startSession();
    try {
      await session.withTransaction(async () => {
        createdOrder = await createOrderFromCart({
          userId,
          shippingAddress,
          shippingCost: SHIPPING_COST_PAISE, // Standardized in minor units
          paymentMethod: "COD",
          checkoutAttemptId,
          session,
        });
      });
    } finally {
      await session.endSession();
    }

    return res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order: createdOrder,
    });
  } catch (err) {
    console.error("COD ORDER CREATION ERROR:", err);
    return res.status(500).json({
      message: err.message || "Failed to place order.",
    });
  }
};

/**
 * 2. GET USER ORDERS
 */
export const getOrder = async (req, res) => {
  const userId = req.user?.id;

  try {
    const orders = await Order.find({ userId }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      orders,
      message: orders.length === 0 ? "You haven't placed any orders yet." : undefined,
    });
  } catch (err) {
    console.error("GET ORDERS ERROR:", err);
    return res.status(500).json({ message: "Failed to retrieve orders." });
  }
};

/**
 * 3. GET SINGLE ORDER (OWNERSHIP GUARDED)
 */
export const getSingleOrder = async (req, res) => {
  const { orderId } = req.params;
  const userId = req.user?.id;

  try {
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ message: "Invalid order ID." });
    }

    const order = await Order.findOne({
      _id: orderId,
      userId,
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }

    return res.status(200).json({
      success: true,
      order,
    });
  } catch (err) {
    console.error("GET SINGLE ORDER ERROR:", err);
    return res.status(500).json({ message: "Failed to retrieve order." });
  }
};

/**
 * 4. ADMIN: GET ALL ORDERS
 */
export const getAllOrder = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      orders,
    });
  } catch (err) {
    console.error("GET ALL ORDERS ERROR:", err);
    return res.status(500).json({ message: "Failed to retrieve orders." });
  }
};

/**
 * 5. ADMIN: UPDATE ORDER STATUS
 */
export const updateOrderStatus = async (req, res) => {
  const { orderId } = req.params;
  const { orderStatus } = req.body;

  const validStatuses = [
    "pending",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
  ];

  if (!validStatuses.includes(orderStatus)) {
    return res.status(400).json({ message: "Invalid order status." });
  }

  const allowedTransitions = {
    pending: ["processing", "cancelled"],
    processing: ["shipped", "cancelled"],
    shipped: ["delivered"],
    delivered: [],
    cancelled: [],
  };

  try {
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }

    if (order.orderStatus === orderStatus) {
      return res.status(200).json({
        success: true,
        message: `Order is already '${orderStatus}'.`,
        order,
      });
    }

    if (!allowedTransitions[order.orderStatus]?.includes(orderStatus)) {
      return res.status(400).json({
        success: false,
        message: `Cannot change order status from '${order.orderStatus}' to '${orderStatus}'.`,
      });
    }

    order.orderStatus = orderStatus;
    await order.save();

    return res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      order,
    });
  } catch (err) {
    console.error("UPDATE ORDER STATUS ERROR:", err);
    return res.status(500).json({ message: "Failed to update order status." });
  }
};

/**
 * 6. CANCEL ORDER (USER/ADMIN) WITH STRIPE REFUND & STOCK RESTORATION
 */
// controllers/order.controller.js

export async function cancelOrder(req, res) {
  const { orderId } = req.params;
  const userId = req.user.id;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const order = await Order.findOne({ _id: orderId, userId }).session(session);

    if (!order) {
      await session.abortTransaction();
      return res.status(404).json({ message: "Order not found." });
    }

    if (!["pending", "processing"].includes(order.orderStatus)) {
      await session.abortTransaction();
      return res.status(400).json({
        message: `Cannot cancel order with status '${order.orderStatus}'.`,
      });
    }

    // 1. Restore Inventory Stock
    if (order.stockReserved) {
      for (const item of order.items) {
        await Product.updateOne(
          { _id: item.productId },
          { $inc: { stock: item.quantity } },
          { session }
        );
      }
      order.stockReserved = false;
    }

    // 2. Process Refund ONLY IF Payment was completed ("paid")
    if (order.paymentMethod === "Stripe" && order.paymentStatus === "paid") {
      const paymentRecord = await Payment.findOne({
        orderId: order._id,
        status: "paid",
      }).session(session);

      if (paymentRecord) {
        await stripe.refunds.create({
          payment_intent: paymentRecord.paymentIntentId,
        });
        paymentRecord.status = "refunded";
        await paymentRecord.save({ session });
        order.paymentStatus = "refunded";
      }
    } else if (order.paymentStatus === "pending") {
      // Pending payments require no Stripe API refund call
      order.paymentStatus = "failed";
    }

    order.orderStatus = "cancelled";
    await order.save({ session });

    await session.commitTransaction();
    return res.status(200).json({ message: "Order cancelled successfully.", order });
  } catch (error) {
    await session.abortTransaction();
    console.error("Cancel order error:", error);
    return res.status(500).json({ message: "Failed to cancel order." });
  } finally {
    session.endSession();
  }
}