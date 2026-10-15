import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: [0, "Price must be non-negative"],
      validate: {
        validator: Number.isInteger,
        message: "Price must be an integer stored in minor units",
      },
    },
    stock: {
      type: Number,
      required: true,
      min: [0, "Stock cannot fall below zero"],
      validate: {
        validator: Number.isInteger,
        message: "Stock must be an integer",
      },
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    images: [
      {
        type: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const Product = mongoose.model("Product", productSchema);