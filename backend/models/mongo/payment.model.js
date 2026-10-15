import mongoose from "mongoose";

export const paymentSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    gateway: {
      type: String,
      enum: ["Stripe", "Razorpay"],
      default: "Stripe",
    },
    paymentIntentId: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "paid", "failed","refunded"],
      default: "pending",
    },
    method: {
      type: String,
      enum: ["UPI", "Card", "NetBanking", "Wallet", "COD"],
    },
  },
  {
    timestamps: true,
  },
);

export const Payment = mongoose.model("Payment", paymentSchema);
