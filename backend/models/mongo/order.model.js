import mongoose from "mongoose";

export const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        name: {
          type: String,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: [1, "Quantity must be at least 1"],
          validate: {
            validator: Number.isInteger,
            message: "Quantity must be an integer",
          },
        },
        price: {
          type: Number,
          required: true,
          min: [0, "Price cannot be negative"],
          validate: {
            validator: Number.isInteger,
            message:
              "Price must be an integer representing minor units (e.g. cents/paise)",
          },
        },
        image: {
          type: String,
          default: "",
        },
      },
    ],

    totalAmount: {
      type: Number,
      required: true,
      min: [0, "Total amount cannot be negative"],
      validate: {
        validator: Number.isInteger,
        message:
          "Total amount must be an integer in minor units (e.g. cents/paise)",
      },
    },

    shippingAmount: {
      type: Number,
      required: true,
      min: [0, "Shipping amount cannot be negative"],
      validate: {
        validator: Number.isInteger,
        message: "Shipping amount must be an integer in minor units",
      },
    },

    shippingAddress: {
      name: { type: String, required: true },
      address: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true },
      phone: { type: String, required: true },
    },

    paymentMethod: {
      type: String,
      enum: ["COD", "Stripe"],
      required: true,
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded", "requires_action"],
      default: "pending",
      index: true,
    },

    orderStatus: {
      type: String,
      enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
      default: "pending",
      index: true,
    },

    checkoutAttemptId: {
      type: String,
      required: true,
    },

    paymentIntentId: {
      type: String,
      default: null,
    },

    // Tracks if inventory was reserved upon creation and released upon cancellation/expiration
    stockReserved: {
      type: Boolean,
      default: true,
    },

    // Audit log for state transitions and reconciliation flags
    reconciliationReason: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

/**
 * INDEX CONSTRAINTS:
 * 1. Guarantees 1 Order document per user checkout attempt
 * 2. Allows instant sparse lookup by Stripe paymentIntentId for Webhooks
 */
orderSchema.index({ userId: 1, checkoutAttemptId: 1 }, { unique: true });

orderSchema.index(
  { paymentIntentId: 1 },
  {
    unique: true,
    partialFilterExpression: {
      paymentIntentId: { $type: "string" },
    },
  },
);

export const Order = mongoose.model("Order", orderSchema);
