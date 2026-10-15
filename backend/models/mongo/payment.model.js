import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      index: true,
    },
    paymentIntentId: {
      type: String,
      required: true,
      unique: true, // Prevents duplicate payment records for the same Stripe Intent
    },
    amount: {
      type: Number,
      required: true,
      min: [0, "Amount must be non-negative"],
      validate: {
        validator: Number.isInteger,
        message: "Amount must be an integer in minor units (e.g. cents/paise)",
      },
    },
    currency: {
      type: String,
      required: true,
      lowercase: true,
      default: "inr",
    },
    status: {
      type: String,
      enum: ["paid", "refunded", "failed", "requires_action"],
      required: true,
    },
    gateway: {
      type: String,
      enum: ["Stripe", "COD"],
      required: true,
    },
    rawMetadata: {
      type: Object,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

export const Payment = mongoose.model("Payment", paymentSchema);