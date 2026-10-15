import { Order } from "../models/mongo/order.model.js";
import { Cart } from "../models/mongo/cart.mongo.js";
import { Product } from "../models/mongo/product.model.js";

export async function createOrderFromCart(
  userId,
  shippingAddress,
  shippingCost,
  paymentMethod,
  checkoutAttemptId,
  session,
) {
  const existingOrder = await Order.findOne({
    userId,
    checkoutAttemptId,
  }).session(session);

  if (existingOrder) {
    return existingOrder;
  }

  const cart = await Cart.findOne({ userId }).session(session);

  if (!cart) {
    throw new Error("Cart not found");
  }

  if (cart.items.length === 0) {
    throw new Error("Cart doesn't have any product to order");
  }

  const orderItems = [];
  let totalAmount = 0;

  for (const item of cart.items) {
    const product = await Product.findOne({
      _id: item.productId,
      isActive: true,
    }).session(session);

    if (!product) {
      continue;
    }

    if (product.stock < item.quantity) {
      throw new Error("Product stock unavailable");
    }

    orderItems.push({
      productId: item.productId,
      name: product.name,
      quantity: item.quantity,
      price: product.price,
      image: product.images?.[0] || "",
    });

    totalAmount += item.quantity * product.price;

    if (paymentMethod === "COD") {
      product.stock -= item.quantity;
      await product.save({ session });
    }
  }

  if (orderItems.length === 0) {
    throw new Error("No available products to order");
  }

  totalAmount += shippingCost;

  const [order] = await Order.create(
    [
      {
        userId,
        items: orderItems,
        totalAmount,
        shippingAmount: shippingCost,
        shippingAddress,

        paymentMethod,

        checkoutAttemptId,

        paymentStatus: "pending",

        orderStatus: paymentMethod === "COD" ? "processing" : "pending",
      },
    ],
    { session },
  );

  const orderedProductIds = orderItems.map((item) => item.productId);

  if (paymentMethod === "COD") {
    await Cart.updateOne(
      { userId },
      {
        $pull: {
          items: {
            productId: { $in: orderedProductIds },
          },
        },
      },
      { session },
    );
  }

  return order;
}
