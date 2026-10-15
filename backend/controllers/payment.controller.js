import mongoose from "mongoose";
import stripe from "../config/stripe.js";
import { Product } from "../models/mongo/product.model.js";
import { Order } from "../models/mongo/order.model.js";
import { Payment } from "../models/mongo/payment.model.js";
import { Cart } from "../models/mongo/cart.mongo.js";
import { createOrderFromCart } from "../services/order.service.js";
import { validateShippingAddress } from "../utils/validateShippingAddress.js";

// stripe listen --forward-to localhost:3000/payments/webhook
export const payment = async (req, res) => {
  const userId = req.user.id;
  const { shippingAddress, checkoutAttemptId } = req.body;

  const validationError = validateShippingAddress(shippingAddress);

  if (!userId) {
    return res.status(400).json({
      message: "User not found",
    });
  }

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

  const shippingCost = 50;
  let order;

  try {
    // Create or retrieve the order in a transaction.
    await mongoose.connection.transaction(async (session) => {
      order = await createOrderFromCart(
        userId,
        shippingAddress,
        shippingCost,
        "Stripe",
        checkoutAttemptId,
        session,
      );
    });

    const paymentIntent = await stripe.paymentIntents.create(
      {
        amount: Math.round(order.totalAmount * 100),
        currency: "inr",
        metadata: {
          orderId: order._id.toString(),
        },
        automatic_payment_methods: {
          enabled: true,
          allow_redirects: "never",
        },
      },
      {
        idempotencyKey: `${userId}-${checkoutAttemptId}`,
      },
    );

    return res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      orderId: order._id,
    });
  } catch (err) {
    console.error("CREATE INTENT ERROR:", err);
    console.error("MongoDB error labels:", err.errorLabels);

    return res.status(500).json({
      message: "Failed to initialize payment",
    });
  }
};

export const webhook = async (req, res) => {
  const signature = req.header("stripe-signature");
  let session;

  try {
    const event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET,
    );

    if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object;
      const orderId = paymentIntent.metadata.orderId;

      if (!orderId) {
        return res.status(400).json({
          message: "Order Id not found in metadata",
        });
      }

      session = await mongoose.startSession();
      session.startTransaction();

      const order = await Order.findById(orderId).session(session);

      if (!order) {
        throw new Error("Order not found");
      }

      if (order.paymentStatus === "paid") {
        await session.abortTransaction();
        return res.sendStatus(200);
      }

      for (const item of order.items) {
        const product = await Product.findById(item.productId).session(session);

        if (!product) {
          throw new Error("Product not found");
        }

        if (product.stock < item.quantity) {
          throw new Error("Insufficient stock");
        }

        product.stock -= item.quantity;

        await product.save({ session });
      }

      const orderedProductIds = order.items.map((item) => item.productId);

      await Cart.updateOne(
        { userId: order.userId },
        {
          $pull: {
            items: {
              productId: { $in: orderedProductIds },
            },
          },
        },
        { session },
      );

      order.paymentStatus = "paid";
      order.orderStatus = "processing";

      await order.save({ session });

      await Payment.create(
        [
          {
            orderId: order._id,
            amount: paymentIntent.amount / 100,
            paymentIntentId: paymentIntent.id,
            status: "paid",
            gateway: "Stripe",
          },
        ],
        { session },
      );

      await session.commitTransaction();

      return res.sendStatus(200);
    }

    return res.sendStatus(200);
  } catch (err) {
    console.error("WEBHOOK ERROR:", err);
    if (session) {
      await session.abortTransaction();
    }

    return res.status(500).json({
      message: err.message,
    });
  } finally {
    if (session) {
      await session.endSession();
    }
  }
};
