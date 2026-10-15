import mongoose from "mongoose";

export const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: Number,
      required: true,
    },

    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
        },

        name: {
          type: String,
          required: true,
        },

        quantity: {
          type: Number,
          required: true,
        },

        price: {
          type: Number,
          required: true,
        },
        image: {
          type: String,
        },
      },
    ],

    totalAmount: {
      type: Number,
      required: true,
    },

    shippingAmount: {
      type: Number,
      required: true,
    },

    shippingAddress: {
      name: {
        type: String,
        required: true,
      },

      address: {
        type: String,
        required: true,
      },

      city: {
        type: String,
        required: true,
      },

      state: {
        type: String,
        required: true,
      },

      pincode: {
        type: String,
        required: true,
      },

      phone: {
        type: String,
        required: true,
      },
    },

    paymentMethod: {
      type: String,
      enum: ["COD", "Stripe"],
      required: true,
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },

    orderStatus: {
      type: String,
      enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
      default: "pending",
    },

    checkoutAttemptId: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
  },
);

orderSchema.index(
  {
    userId: 1,
    checkoutAttemptId: 1,
  },
  {
    unique: true,
    partialFilterExpression: {
      checkoutAttemptId: {
        $type: "string",
      },
    },
  },
);

export const Order = mongoose.model("Order", orderSchema);
