import mongoose from "mongoose";
import stripe from "../config/stripe.js";

import { Product } from "../models/mongo/product.model.js";
import { Order } from "../models/mongo/order.model.js";
import { Payment } from "../models/mongo/payment.model.js";
import { ProcessedEvent } from "../models/mongo/processedEvent.model.js";

import { createOrderFromCart } from "../services/order.service.js";
import { validateShippingAddress } from "../utils/validateShippingAddress.js";

const SHIPPING_COST = 5000; // INR paise

/**
 * 1. INITIALIZE PAYMENT AND ORDER
 */
export const payment = async (req, res) => {
  const userId = req.user?.id;
  const { shippingAddress, checkoutAttemptId } = req.body;

  if (!userId) {
    return res.status(401).json({ message: "Authentication required." });
  }

  const addressError = validateShippingAddress(shippingAddress);

  if (addressError) {
    return res.status(400).json({ message: addressError });
  }

  if (
    typeof checkoutAttemptId !== "string" ||
    checkoutAttemptId.trim().length === 0
  ) {
    return res.status(400).json({
      message: "A valid checkout attempt ID is required.",
    });
  }

  let order;

  try {
    const session = await mongoose.startSession();

    try {
      await session.withTransaction(async () => {
        order = await createOrderFromCart({
          userId,
          shippingAddress,
          shippingCost: SHIPPING_COST,
          paymentMethod: "Stripe",
          checkoutAttemptId,
          session,
        });
      });
    } finally {
      await session.endSession();
    }

    // An existing order may already have a PaymentIntent.
    if (order.paymentIntentId) {
      const existingIntent = await stripe.paymentIntents.retrieve(
        order.paymentIntentId
      );

      return res.status(200).json({
        clientSecret: existingIntent.client_secret,
        paymentIntentId: existingIntent.id,
        orderId: order._id,
      });
    }

    // Do not initialize a new intent for an order that is no longer payable.
    if (
      order.paymentStatus !== "pending" ||
      order.orderStatus === "cancelled" ||
      order.stockReserved !== true
    ) {
      return res.status(409).json({
        message: "This checkout can no longer accept payment. Start a new checkout.",
      });
    }

    const paymentIntent = await stripe.paymentIntents.create(
      {
        amount: order.totalAmount,
        currency: "inr",
        metadata: {
          orderId: order._id.toString(),
          userId: userId.toString(),
          checkoutAttemptId,
        },
        automatic_payment_methods: {
          enabled: true,
          allow_redirects: "never",
        },
      },
      {
        idempotencyKey: `pi_${userId}_${checkoutAttemptId}`,
      }
    );

    // Attach the PaymentIntent only if it is still unassigned.
    const attachResult = await Order.updateOne(
      {
        _id: order._id,
        paymentMethod: "Stripe",
        paymentIntentId: null,
        paymentStatus: "pending",
        stockReserved: true,
        orderStatus: { $ne: "cancelled" },
      },
      {
        $set: { paymentIntentId: paymentIntent.id },
      }
    );

    // Handle concurrent requests: an identical intent is acceptable,
    // but a different intent must never silently replace the stored one.
    const latestOrder = await Order.findById(order._id);

    if (
      !latestOrder ||
      latestOrder.paymentIntentId !== paymentIntent.id
    ) {
      console.error("PaymentIntent association conflict", {
        orderId: order._id.toString(),
        paymentIntentId: paymentIntent.id,
        modifiedCount: attachResult.modifiedCount,
      });

      return res.status(409).json({
        message: "Unable to confirm this payment session. Please contact support.",
      });
    }

    return res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      orderId: order._id,
    });
  } catch (err) {
    console.error("PAYMENT INITIALIZATION ERROR:", err);

    // A Stripe timeout can leave the result ambiguous. Do not release
    // stock automatically; retry using the same idempotency key.
    return res.status(500).json({
      message: "Unable to initialize payment. Please retry or contact support.",
    });
  }
};

/**
 * 2. STRIPE WEBHOOK
 *
 * Important:
 * The route must provide the unparsed raw request body to this handler.
 */
export const webhook = async (req, res) => {
  const signature = req.header("stripe-signature");

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return res.status(400).send("Missing webhook signature configuration.");
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("STRIPE SIGNATURE VERIFICATION FAILED:", err.message);
    return res.status(400).send("Invalid webhook signature.");
  }

  const supportedEvents = new Set([
    "payment_intent.succeeded",
    "payment_intent.payment_failed",
    "payment_intent.canceled",
  ]);

  // Acknowledge verified events that this handler does not process.
  if (!supportedEvents.has(event.type)) {
    return res.sendStatus(200);
  }

  const paymentIntent = event.data.object;
  const metadata = paymentIntent.metadata || {};
  const orderId = metadata.orderId;

  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
      // A duplicate event must not repeat any business side effects.
      const alreadyProcessed = await ProcessedEvent.findOne({
        eventId: event.id,
        status: "completed",
      }).session(session);

      if (alreadyProcessed) {
        return;
      }

      // The event record and all database changes commit or roll back together.
      // The unique eventId index protects against concurrent deliveries.
      await ProcessedEvent.create(
        [
          {
            eventId: event.id,
            eventType: event.type,
            status: "processing",
          },
        ],
        { session }
      );

      if (!orderId || !mongoose.isValidObjectId(orderId)) {
        await ProcessedEvent.updateOne(
          { eventId: event.id },
          {
            $set: {
              status: "completed",
              processedAt: new Date(),
            },
          },
          { session }
        );

        return;
      }

      const order = await Order.findById(orderId).session(session);

      if (!order) {
        // Acknowledge and log an unresolvable event for manual investigation.
        console.error("Stripe event references a missing order", {
          eventId: event.id,
          orderId,
        });

        await ProcessedEvent.updateOne(
          { eventId: event.id },
          {
            $set: {
              status: "completed",
              processedAt: new Date(),
            },
          },
          { session }
        );

        return;
      }

      // Verify all available identifiers before changing payment state.
      const metadataMatches =
        metadata.userId === order.userId.toString() &&
        metadata.checkoutAttemptId === order.checkoutAttemptId;

      const intentMatches =
        !order.paymentIntentId ||
        order.paymentIntentId === paymentIntent.id;

      if (!metadataMatches || !intentMatches) {
        order.reconciliationReason =
          "Stripe webhook metadata or PaymentIntent association mismatch";

        await order.save({ session });

        console.error("Stripe webhook association mismatch", {
          eventId: event.id,
          orderId,
          paymentIntentId: paymentIntent.id,
        });

        await ProcessedEvent.updateOne(
          { eventId: event.id },
          {
            $set: {
              status: "completed",
              processedAt: new Date(),
            },
          },
          { session }
        );

        return;
      }

      if (event.type === "payment_intent.succeeded") {
        const amountMatches = paymentIntent.amount === order.totalAmount;
        const currencyMatches =
          paymentIntent.currency?.toLowerCase() === "inr";

        if (!amountMatches || !currencyMatches) {
          order.reconciliationReason =
            "Stripe reported successful payment with an unexpected amount or currency";

          // Do not mark the order paid or fulfill it.
          // The funds may have been collected, so reconciliation/refund is required.
          await order.save({ session });

          console.error("Stripe payment amount/currency mismatch", {
            eventId: event.id,
            orderId,
            receivedAmount: paymentIntent.amount,
            expectedAmount: order.totalAmount,
            receivedCurrency: paymentIntent.currency,
          });
        } else if (
          order.paymentStatus === "paid" &&
          order.paymentIntentId === paymentIntent.id
        ) {
          // Already handled by another event; no repeated side effects.
        } else if (
          order.orderStatus === "cancelled" ||
          order.stockReserved !== true ||
          order.paymentStatus === "failed" ||
          order.paymentStatus === "refunded"
        ) {
          // Payment succeeded after the order was no longer eligible.
          // Preserve the order's cancellation state and record the money received.
          order.paymentIntentId = paymentIntent.id;
          order.reconciliationReason =
            "Payment succeeded after order cancellation or stock reservation release";

          await order.save({ session });

          await Payment.updateOne(
            { paymentIntentId: paymentIntent.id },
            {
              $setOnInsert: {
                orderId: order._id,
                paymentIntentId: paymentIntent.id,
                amount: paymentIntent.amount,
                currency: paymentIntent.currency.toLowerCase(),
                status: "paid",
                gateway: "Stripe",
                rawMetadata: metadata,
              },
            },
            { upsert: true, session }
          );

          console.error("Late Stripe success requires reconciliation", {
            eventId: event.id,
            orderId,
            paymentIntentId: paymentIntent.id,
          });
        } else {
          // A success event may arrive before the initialization request
          // has saved the PaymentIntent ID. Associate it if still unassigned.
          order.paymentIntentId = paymentIntent.id;
          order.paymentStatus = "paid";
          order.orderStatus = "processing";
          order.reconciliationReason = null;

          await order.save({ session });

          await Payment.updateOne(
            { paymentIntentId: paymentIntent.id },
            {
              $setOnInsert: {
                orderId: order._id,
                paymentIntentId: paymentIntent.id,
                amount: paymentIntent.amount,
                currency: paymentIntent.currency.toLowerCase(),
                status: "paid",
                gateway: "Stripe",
                rawMetadata: metadata,
              },
            },
            { upsert: true, session }
          );
        }
      }

      if (event.type === "payment_intent.payment_failed") {
        // A failed payment attempt does not necessarily mean the intent
        // is terminal. The customer may still retry the same PaymentIntent.
        // Keep the order and its stock reservation unchanged.
      }

      if (event.type === "payment_intent.canceled") {
        if (order.paymentStatus !== "paid") {
          // Release reserved stock exactly once.
          if (order.stockReserved === true) {
            for (const item of order.items) {
              const result = await Product.updateOne(
                { _id: item.productId },
                { $inc: { stock: item.quantity } },
                { session }
              );

              if (result.matchedCount !== 1) {
                throw new Error(
                  `Could not restore reserved stock for product ${item.productId}`
                );
              }
            }

            order.stockReserved = false;
          }

          if (order.paymentStatus !== "refunded") {
            order.paymentStatus = "failed";
          }

          order.orderStatus = "cancelled";
          await order.save({ session });
        }
      }

      await ProcessedEvent.updateOne(
        { eventId: event.id },
        {
          $set: {
            status: "completed",
            processedAt: new Date(),
          },
        },
        { session }
      );
    });

    return res.sendStatus(200);
  } catch (err) {
    // If a concurrent delivery inserted the same event ID, acknowledge it
    // only after confirming that the winning transaction completed.
    if (err.code === 11000) {
      const existingEvent = await ProcessedEvent.findOne({
        eventId: event.id,
      }).catch(() => null);

      if (existingEvent?.status === "completed") {
        return res.sendStatus(200);
      }
    }

    console.error("STRIPE WEBHOOK PROCESSING ERROR:", {
      eventId: event.id,
      eventType: event.type,
      error: err.message,
    });

    // A non-2xx response lets Stripe retry transient failures.
    return res.sendStatus(500);
  } finally {
    await session.endSession();
  }
};
