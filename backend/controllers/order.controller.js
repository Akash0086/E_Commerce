import { Order } from "../models/mongo/order.model.js";
import { Product } from "../models/mongo/product.model.js";
import { Payment } from "../models/mongo/payment.model.js";
import mongoose from "mongoose";
import stripe from "../config/stripe.js";
import { createOrderFromCart } from "../services/order.service.js";
import { validateShippingAddress } from "../utils/validateShippingAddress.js";

export const order = async (req, res) => {
  const userId = req.user.id;
  const { shippingAddress, checkoutAttemptId } = req.body;
  const shippingCost = 50;
  const session = await mongoose.startSession();

  const validationError = validateShippingAddress(shippingAddress);

  if (validationError) {
    return res.status(400).json({
      message: validationError,
    });
  }

  if (!checkoutAttemptId) {
    return res.status(400).json({
      message: "Checkout attempt id is required",
    });
  }

  try {
    session.startTransaction();

    const order = await createOrderFromCart(
      userId,
      shippingAddress,
      shippingCost,
      "COD",
      checkoutAttemptId,
      session,
    );

    await session.commitTransaction();

    return res.status(201).json({
      message: "Order placed successfully",
      order,
    });
  } catch (err) {
    await session.abortTransaction();

    return res.status(500).json({
      message: err.message,
    });
  } finally {
    await session.endSession();
  }
};

export const getOrder = async (req, res) => {
  const userId = req.user.id;

  try {
    const orders = await Order.find({ userId }).sort({ createdAt: -1 });

    if (orders.length === 0) {
      return res.status(200).json({
        success: true,
        orders: [],
        message: "You haven't placed any orders yet...",
      });
    }
    return res.status(200).json({
      success: true,
      orders,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const getSingleOrder = async (req, res) => {
  const { orderId } = req.params;

  try {
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ message: "Invalid order Id" });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    if (order.userId !== req.user.id) {
      return res.status(403).json({
        message: "Forbidden: You are not allowed to access this order",
      });
    }
    return res.status(200).json({
      success: true,
      order,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const getAllOrder = async (req, res) => {
  console.log("GET ALL ADMIN ORDERS CONTROLLER");

  try {
    const orders = await Order.find().sort({ createdAt: -1 });

    if (orders.length === 0) {
      return res.status(200).json({ orders });
    }
    return res.status(200).json({
      success: true,
      orders,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { orderStatus } = req.body;

    const validStatus = [
      "pending",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
    ];

    if (!validStatus.includes(orderStatus)) {
      return res.status(400).json({
        message: "Invalid order status",
      });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    const allowedTransitions = {
      pending: ["processing", "cancelled"],
      processing: ["shipped", "cancelled"],
      shipped: ["delivered"],
      delivered: [],
      cancelled: [],
    };

    if (order.orderStatus === orderStatus) {
      return res.status(200).json({
        success: true,
        message: `Order is already '${orderStatus}'.`,
        order,
      });
    }

    if (!allowedTransitions[order.orderStatus].includes(orderStatus)) {
      return res.status(400).json({
        success: false,
        message: `Cannot change order status from '${order.orderStatus}' to '${orderStatus}'.`,
      });
    }

    order.orderStatus = orderStatus;

    await order.save();

    return res.status(200).json({
      message: "Order status updated successfully",
      order,
    });
  } catch (err) {
    return res.status(500).json({
      message: err.message,
    });
  }
};

export const cancelOrder = async (req, res) => {
  const { orderId } = req.params;
  const userId = req.user.id;
  const cancellableStatus = ["pending", "processing"];
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const order = await Order.findById(orderId).session(session);

    if (!order) {
      await session.abortTransaction();
      return res.status(404).json({ message: "order cannot found" });
    }

    if (userId !== order.userId) {
      await session.abortTransaction();
      return res
        .status(403)
        .json({ message: "user doesn't have access to this order" });
    }

    if (!cancellableStatus.includes(order.orderStatus)) {
      await session.abortTransaction();
      return res.status(400).json({
        message: `Order cannot be cancelled when status is '${order.orderStatus}'`,
      });
    }

    const shouldRestoreStock = order.orderStatus === "processing";
    const needsRefund =
      order.paymentMethod === "Stripe" && order.paymentStatus === "paid";

    if (shouldRestoreStock) {
      for (const item of order.items) {
        const product = await Product.findById(item.productId).session(session);

        if (!product) {
          await session.abortTransaction();
          return res.status(404).json({
            message: `Product not found: ${item.productId}`,
          });
        }

        product.stock += item.quantity;

        await product.save({ session });
      }
    }

    if (needsRefund) {
      const payment = await Payment.findOne({
        orderId: order._id,
        status: "paid",
      }).session(session);

      if (!payment) {
        await session.abortTransaction();

        return res.status(404).json({
          message: "Payment record not found for this order",
        });
      }

      await stripe.refunds.create(
        {
          payment_intent: payment.paymentIntentId,
        },
        {
          idempotencyKey: `refund-${order._id}`,
        },
      );

      order.paymentStatus = "refunded";
      payment.status = "refunded";

      await payment.save({ session });
    }

    order.orderStatus = "cancelled";
    await order.save({ session });

    await session.commitTransaction();
    return res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
      order,
    });
  } catch (err) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }

    return res.status(500).json({
      message: "something went wrong",
      error: err.message,
    });
  } finally {
    await session.endSession();
  }
};
