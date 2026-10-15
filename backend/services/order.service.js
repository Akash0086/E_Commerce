import { Order } from "../models/mongo/order.model.js";
import { Cart } from "../models/mongo/cart.mongo.js";
import { Product } from "../models/mongo/product.model.js";

export async function createOrderFromCart({
  userId,
  shippingAddress,
  shippingCost,
  paymentMethod,
  checkoutAttemptId,
  paymentIntentId = null,
  session,
}) {
  // 1. Mandatory Session Guard
  if (!session) {
    throw new Error("A database transaction session is required to create an order.");
  }

  // 2. Strict Input & Type Validation
  if (!["COD", "Stripe"].includes(paymentMethod)) {
    throw new Error("Invalid payment method.");
  }

  if (!Number.isSafeInteger(shippingCost) || shippingCost < 0) {
    throw new Error("Invalid shipping cost. Must be a non-negative safe integer.");
  }

  if (
    typeof checkoutAttemptId !== "string" ||
    checkoutAttemptId.trim().length === 0
  ) {
    throw new Error("A valid checkoutAttemptId is required.");
  }

  // 3. Application-level Idempotency Lookup
  const existingOrder = await Order.findOne({
    userId,
    checkoutAttemptId,
  }).session(session);

  if (existingOrder) {
    if (existingOrder.paymentMethod !== paymentMethod) {
      throw new Error(
        "Mismatched payment method for an existing checkout attempt."
      );
    }
    return existingOrder;
  }

  // 4. Fetch Cart
  const cart = await Cart.findOne({ userId }).session(session);

  if (!cart || !cart.items || cart.items.length === 0) {
    throw new Error("Cart is empty or does not exist.");
  }

  // 5. Validate Product IDs and Batch Fetch
  const validProductIds = [];
  for (const item of cart.items) {
    if (!item.productId) {
      throw new Error(
        "A product in your cart is no longer available. Please refresh your cart."
      );
    }
    validProductIds.push(item.productId);
  }

  const products = await Product.find({
    _id: { $in: validProductIds },
  }).session(session);

  const productMap = new Map(products.map((p) => [p._id.toString(), p]));

  // 6. Item Processing, Price Snapshotting & Conditional Stock Reservation
  const orderItems = [];
  let itemsSubtotal = 0;

  for (const item of cart.items) {
    if (!Number.isSafeInteger(item.quantity) || item.quantity <= 0) {
      throw new Error("Invalid product quantity in cart.");
    }

    const product = productMap.get(item.productId.toString());

    if (!product || !product.isActive) {
      throw new Error(
        "A product in your cart is no longer available. Please refresh your cart."
      );
    }

    if (!Number.isSafeInteger(product.price) || product.price < 0) {
      throw new Error(`Invalid product price snapshot for: ${product.name}`);
    }

    // Conditionally deduct stock only when sufficient inventory is available
    const stockUpdateResult = await Product.updateOne(
      {
        _id: item.productId,
        isActive: true,
        stock: { $gte: item.quantity },
      },
      {
        $inc: { stock: -item.quantity },
      },
      { session }
    );

    if (stockUpdateResult.modifiedCount !== 1) {
      throw new Error(
        `Insufficient stock or item became unavailable: ${product.name}`
      );
    }

    const itemTotal = item.quantity * product.price;
    if (!Number.isSafeInteger(itemTotal)) {
      throw new Error(`Item total exceeds safe integer limits for: ${product.name}`);
    }

    orderItems.push({
      productId: item.productId,
      name: product.name,
      quantity: item.quantity,
      price: product.price,
      image: product.images?.[0] || "",
    });

    itemsSubtotal += itemTotal;
  }

  // 7. Total Calculation
  if (!Number.isSafeInteger(itemsSubtotal)) {
    throw new Error("Order subtotal exceeds the supported monetary range.");
  }

  const totalAmount = itemsSubtotal + shippingCost;

  if (!Number.isSafeInteger(totalAmount)) {
    throw new Error("Order total exceeds the supported monetary range.");
  }

  // 8. Create Order Document
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
        paymentIntentId,
        paymentStatus: "pending",
        orderStatus: paymentMethod === "COD" ? "processing" : "pending",
        stockReserved: true,
      },
    ],
    { session }
  );

  // 9. Atomic Cart Cleanup
  const orderedProductIds = orderItems.map((item) => item.productId);
  await Cart.updateOne(
    { userId },
    {
      $pull: {
        items: {
          productId: { $in: orderedProductIds },
        },
      },
    },
    { session }
  );

  return order;
}