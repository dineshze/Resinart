import CustomRequest from "../models/CustomRequest.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import { createPaymentForOrder } from "../services/payments/index.js";
import mongoose from "mongoose";

const orderStatuses = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];

function required(value) {
  return typeof value === "string" && value.trim().length > 0;
}

export async function createOrder(req, res, next) {
  try {
    const { items, shippingAddress, paymentMethod = "cod" } = req.body;

    if (!Array.isArray(items) || items.length === 0) return res.status(400).json({ message: "Cart is empty" });
    if (paymentMethod !== "cod") return res.status(400).json({ message: "Only Cash on Delivery is available right now" });

    const requiredAddress = ["fullName", "phone", "address", "city", "state", "pincode"];
    const hasAddress = requiredAddress.every((key) => required(shippingAddress?.[key]));
    if (!hasAddress) return res.status(400).json({ message: "Complete shipping address is required" });

    const productIds = items.map((item) => item.product || item.productId);
    if (productIds.some((id) => !mongoose.Types.ObjectId.isValid(id))) {
      return res.status(400).json({ message: "A product in your cart is no longer available" });
    }
    const products = await Product.find({ _id: { $in: productIds } });
    const productMap = new Map(products.map((product) => [product._id.toString(), product]));

    const orderItems = items.map((item) => {
      const productId = String(item.product || item.productId);
      const product = productMap.get(productId);
      const quantity = Number(item.quantity);
      if (!product) {
        const error = new Error("A product in your cart is no longer available");
        error.status = 400;
        throw error;
      }
      if (!Number.isInteger(quantity) || quantity < 1) {
        const error = new Error("Invalid product quantity");
        error.status = 400;
        throw error;
      }
      if (product.stock < quantity) {
        const error = new Error(`${product.name} has only ${product.stock} in stock`);
        error.status = 400;
        throw error;
      }
      return {
        product: product._id,
        name: product.name,
        image: product.image,
        price: product.price,
        quantity
      };
    });

    const subtotal = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const payment = createPaymentForOrder(paymentMethod);
    const order = await Order.create({
      user: req.user._id,
      userDetails: { name: req.user.name, email: req.user.email },
      items: orderItems,
      shippingAddress,
      subtotal,
      totalAmount: subtotal,
      payment,
      orderStatus: "pending"
    });

    await Promise.all(
      orderItems.map((item) => Product.updateOne({ _id: item.product }, { $inc: { stock: -item.quantity } }))
    );

    res.status(201).json(order);
  } catch (error) {
    next(error);
  }
}

export async function listMyOrders(req, res, next) {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    next(error);
  }
}

export async function getMyOrder(req, res, next) {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  } catch (error) {
    next(error);
  }
}

export async function listOrders(req, res, next) {
  try {
    const { status, q } = req.query;
    const filter = {};
    if (status && status !== "all") filter.orderStatus = status;
    if (q) {
      filter.$or = [
        { "userDetails.name": { $regex: q, $options: "i" } },
        { "userDetails.email": { $regex: q, $options: "i" } },
        { "shippingAddress.phone": { $regex: q, $options: "i" } }
      ];
    }
    const orders = await Order.find(filter).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    next(error);
  }
}

export async function updateOrder(req, res, next) {
  try {
    const { orderStatus, status } = req.body;
    const nextStatus = orderStatus || status;
    if (!orderStatuses.includes(nextStatus)) return res.status(400).json({ message: "Invalid order status" });

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { orderStatus: nextStatus },
      { new: true, runValidators: true }
    );
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  } catch (error) {
    next(error);
  }
}

export async function analytics(_req, res, next) {
  try {
    const [products, orders, pendingOrders, deliveredOrders, featured, revenueResult] = await Promise.all([
      Product.countDocuments(),
      Order.countDocuments(),
      Order.countDocuments({ orderStatus: "pending" }),
      Order.countDocuments({ orderStatus: "delivered" }),
      Product.countDocuments({ featured: true }),
      Order.aggregate([
        { $match: { orderStatus: { $ne: "cancelled" } } },
        { $group: { _id: null, revenue: { $sum: "$totalAmount" } } }
      ])
    ]);

    res.json({
      products,
      orders,
      pendingOrders,
      deliveredOrders,
      featured,
      revenue: revenueResult[0]?.revenue || 0
    });
  } catch (error) {
    next(error);
  }
}

export async function createCustomRequest(req, res, next) {
  try {
    const request = await CustomRequest.create(req.body);
    res.status(201).json(request);
  } catch (error) {
    next(error);
  }
}

export async function listCustomRequests(_req, res, next) {
  try {
    const requests = await CustomRequest.find().sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    next(error);
  }
}

export async function updateCustomRequest(req, res, next) {
  try {
    const request = await CustomRequest.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!request) return res.status(404).json({ message: "Custom request not found" });
    res.json(request);
  } catch (error) {
    next(error);
  }
}
