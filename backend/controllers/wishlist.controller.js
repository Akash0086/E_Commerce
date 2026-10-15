import { Wishlist } from "../models/mongo/wishlist.model.js";
import { Product } from "../models/mongo/product.model.js";

export const addToWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: "product doesn't exist" });
    }
    const wishlist = await Wishlist.findOne({ userId });

    if (!wishlist) {
      const newWishlist = await Wishlist.create({
        userId,
        items: [
          {
            productId: product._id,
          },
        ],
      });

      return res.status(201).json({
        message: "Product added to wishlist",
        wishlist: newWishlist,
      });
    }

    let alreadyExists = false;

    for (const item of wishlist.items) {
      if (item.productId.equals(productId)) {
        alreadyExists = true;
        break;
      }
    }
    if (alreadyExists) {
      return res.status(400).json({
        message: "Product already exists in wishlist",
      });
    }

    wishlist.items.push({
      productId: product._id,
    });

    await wishlist.save();

    return res.status(200).json({
      message: "Product added to wishlist",
      wishlist,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Something went wrong",
      error: err.message,
    });
  }
};

export const getWishlist = async (req, res) => {
  try {
    const userId = req.user.id;

    const wishlist = await Wishlist.findOne({ userId }).populate(
      "items.productId",
    );

    if (!wishlist) {
      return res.status(200).json({
        items: [],
      });
    }

    return res.status(200).json({
      items: wishlist.items,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Something went wrong",
      error: err.message,
    });
  }
};

export const removeFromWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;

    const wishlist = await Wishlist.findOne({ userId });

    if (!wishlist) {
      return res.status(404).json({
        message: "Wishlist not found",
      });
    }
    
    const originalLength = wishlist.items.length;

    wishlist.items = wishlist.items.filter(
      (item) => !item.productId.equals(productId),
    );

    if (wishlist.items.length === originalLength) {
      return res.status(404).json({
        message: "Product not found in wishlist",
      });
    }

    await wishlist.save();

    return res.status(200).json({
      message: "Product removed from wishlist",
      wishlist,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Something went wrong",
      error: err.message,
    });
  }
};
