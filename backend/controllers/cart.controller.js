
import mongoose from "mongoose";
import { Cart } from "../models/mongo/cart.mongo.js";
import { Product } from "../models/mongo/product.model.js";

const isValidObjectId = (id) =>
  mongoose.Types.ObjectId.isValid(id);

const validateQuantity = (value) => {
  const quantity = Number(value);

  return Number.isInteger(quantity) && quantity >= 1
    ? quantity
    : null;
};

export const getCart = async (req, res) => {
  const userId = req.user.id;

  if (!isValidObjectId(userId)) {
    return res.status(401).json({
      message: "Invalid authenticated user",
    });
  }

  try {
    const cartDetails = await Cart.findOne({ userId }).populate(
      "items.productId",
    );

    if (!cartDetails) {
      return res.status(404).json({
        message: "Cart not found",
      });
    }

    const hasDeletedProducts = cartDetails.items.some(
      (item) => item.productId === null,
    );

    if (hasDeletedProducts) {
      cartDetails.items = cartDetails.items.filter(
        (item) => item.productId !== null,
      );

      await cartDetails.save();
    }

    return res.status(200).json({ cartDetails });
  } catch (err) {
    console.error("Get cart error:", err);

    return res.status(500).json({
      message: "Failed to retrieve cart",
    });
  }
};

export const postCart = async (req, res) => {
  const userId = req.user.id;
  const { productId } = req.body;
  const quantity = validateQuantity(req.body.quantity);

  if (!isValidObjectId(userId)) {
    return res.status(401).json({
      message: "Invalid authenticated user",
    });
  }

  if (!isValidObjectId(productId)) {
    return res.status(400).json({
      message: "Invalid product ID",
    });
  }

  if (quantity === null) {
    return res.status(400).json({
      message: "Quantity must be a positive integer",
    });
  }

  try {
    const product = await Product.findOne({
      _id: productId,
      isActive: true,
    });

    if (!product) {
      return res.status(404).json({
        message: "Product does not exist",
      });
    }

    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = new Cart({
        userId,
        items: [],
      });
    }

    const existingItem = cart.items.find(
      (item) => item.productId.toString() === productId,
    );

    const newQuantity = existingItem
      ? existingItem.quantity + quantity
      : quantity;

    if (newQuantity > product.stock) {
      return res.status(400).json({
        message: "Insufficient stock availability",
      });
    }

    if (existingItem) {
      existingItem.quantity = newQuantity;
    } else {
      cart.items.push({
        productId,
        quantity,
      });
    }

    await cart.save();

    return res.status(200).json({
      message: "Product added to cart successfully",
    });
  } catch (err) {
    console.error("Add to cart error:", err);

    return res.status(500).json({
      message: "Failed to add product to cart",
    });
  }
};

export const putCart = async (req, res) => {
  const userId = req.user.id;
  const { productId } = req.params;
  const quantity = validateQuantity(req.body.quantity);

  if (!isValidObjectId(userId)) {
    return res.status(401).json({
      message: "Invalid authenticated user",
    });
  }

  if (!isValidObjectId(productId)) {
    return res.status(400).json({
      message: "Invalid product ID",
    });
  }

  if (quantity === null) {
    return res.status(400).json({
      message: "Quantity must be a positive integer",
    });
  }

  try {
    const product = await Product.findOne({
      _id: productId,
      isActive: true,
    });

    if (!product) {
      return res.status(404).json({
        message: "Product does not exist",
      });
    }

    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).json({
        message: "Cart not found",
      });
    }

    const existingItem = cart.items.find(
      (item) => item.productId.toString() === productId,
    );

    if (!existingItem) {
      return res.status(404).json({
        message: "Product not found in cart",
      });
    }

    if (quantity > product.stock) {
      return res.status(400).json({
        message: "Insufficient stock availability",
      });
    }

    existingItem.quantity = quantity;

    await cart.save();

    return res.status(200).json({
      message: "Quantity updated successfully",
    });
  } catch (err) {
    console.error("Update cart error:", err);

    return res.status(500).json({
      message: "Failed to update cart",
    });
  }
};

export const deleteCart = async (req, res) => {
  const userId = req.user.id;
  const { productId } = req.params;

  if (!isValidObjectId(userId)) {
    return res.status(401).json({
      message: "Invalid authenticated user",
    });
  }

  if (!isValidObjectId(productId)) {
    return res.status(400).json({
      message: "Invalid product ID",
    });
  }

  try {
    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).json({
        message: "Cart not found",
      });
    }

    const existingItem = cart.items.find(
      (item) => item.productId.toString() === productId,
    );

    if (!existingItem) {
      return res.status(404).json({
        message: "Product not found in cart",
      });
    }

    cart.items = cart.items.filter(
      (item) => item.productId.toString() !== productId,
    );

    await cart.save();

    return res.status(200).json({
      message: "Product removed from cart successfully",
      cart,
    });
  } catch (err) {
    console.error("Delete cart error:", err);

    return res.status(500).json({
      message: "Failed to remove product from cart",
    });
  }
};
