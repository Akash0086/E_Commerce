import { Cart } from "../models/mongo/cart.mongo.js";
import { Product } from "../models/mongo/product.model.js";

export const getCart = async (req, res) => {
  const userId = req.user.id;

  try {
    const cartDetails = await Cart.findOne({ userId }).populate(
      "items.productId",
    );

    if (!cartDetails) {
      return res.status(404).json({ message: "Not Found!" });
    }

    const hasDeletedProducts = cartDetails.items.some(
      (item) => item.productId === null,
    );
    const availableItems = cartDetails.items.filter(
      (item) => item.productId !== null,
    );

    if (hasDeletedProducts) {
      cartDetails.items = availableItems;
      await cartDetails.save();
    }

    return res.status(200).json({ cartDetails });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const postCart = async (req, res) => {
  const userId = req.user.id;
  const { productId, quantity: qty } = req.body;
  let quantity = Number(qty);

  if (Number.isNaN(quantity) || !Number.isInteger(quantity) || quantity < 1) {
    return res
      .status(400)
      .json({ message: "quantity should be greater than and equal to 1" });
  }
  let cart;
  try {
    const product = await Product.findOne({
      _id: productId,
      isActive: true,
    });

    if (!product) {
      return res.status(404).json({ message: "product doesn't exist" });
    } else if (product.stock < quantity) {
      return res.status(400).json({ message: "Insufficient stock available" });
    } else {
      cart = await Cart.findOne({ userId });

      if (!cart) {
        cart = await Cart.create({
          userId,
          items: [],
        });
      }
    }

    const existProduct = cart.items.find(
      (item) => item.productId.toString() === productId,
    );

    if (existProduct) {
      quantity += existProduct.quantity;
    }

    if (existProduct) {
      if (quantity <= product.stock) {
        existProduct.quantity = quantity;
      } else {
        return res
          .status(400)
          .json({ message: "Insufficient stock availability" });
      }
    } else {
      if (quantity > product.stock) {
        return res
          .status(400)
          .json({ message: "Insufficient stock availability" });
      } else {
        cart.items.push({
          productId,
          quantity,
        });
      }
    }

    await cart.save();

    return res
      .status(201)
      .json({ message: "successfully added the product to cart" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const putCart = async (req, res) => {
  const userId = req.user.id;
  let cart;

  const { productId } = req.params;

  const { quantity: qty } = req.body;
  let quantity = Number(qty);

  if (Number.isNaN(quantity) || !Number.isInteger(quantity) || quantity < 1) {
    return res
      .status(400)
      .json({ message: "quantity should be greater than and equal to 1" });
  }
  try {
    const product = await Product.findOne({
      _id: productId,
      isActive: true,
    });

    if (!product) {
      return res.status(404).json({ message: "product doesn't exist" });
    }

    cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).json({ message: "cannot find the cart" });
    }

    const existProduct = cart.items.find(
      (item) => item.productId.toString() === productId,
    );

    if (!existProduct) {
      return res.status(404).json({ message: "Product not found in cart" });
    }
    if (product.stock >= quantity) {
      existProduct.quantity = quantity;
    } else {
      return res
        .status(400)
        .json({ message: "Insufficient stock availability" });
    }
    await cart.save();

    return res.status(200).json({ message: "Quantity updated successfully" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const deleteCart = async (req, res) => {
  const userId = req.user.id;
  const { productId } = req.params;
  let cart;
  try {
    cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const existProduct = cart.items.find(
      (item) => item.productId.toString() === productId,
    );

    if (!existProduct) {
      return res.status(404).json({ message: "Product not found in cart" });
    }
    cart.items = cart.items.filter(
      (item) => item.productId.toString() !== productId,
    );

    await cart.save();

    return res.status(200).json({
      message: "successfully deleted the product",
      cart,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
