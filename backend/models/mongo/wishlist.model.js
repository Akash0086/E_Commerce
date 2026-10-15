import mongoose from "mongoose";

export const wishlistSchema = new mongoose.Schema({
  userId: {
    type: Number,
    required: true,
    unique: true,
  },
  items: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
    },
  ],
},{
  timestamps: true,
});

export const Wishlist = mongoose.model("Wishlist", wishlistSchema);
