import CustomRequest from "../models/CustomRequest.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import { createPaymentForOrder } from "../services/payments/index.js";
import { cleanupLocalFile, uploadImageToCloudinary, uploadManyImagesToCloudinary } from "../utils/cloudinary.js";
import mongoose from "mongoose";

const orderStatuses = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];
const paymentStatuses = ["payment_pending", "screenshot_uploaded", "payment_verified", "payment_rejected"];
const verificationStatuses = ["pending", "uploaded", "verified", "rejected"];

function required(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function buildOrderRef() {
  return `RSN${Math.floor(1000 + Math.random() * 9000)}`;
}

function buildPaymentNote(orderItems, orderRef) {
  const productLines = orderItems
    .map((item) => `RESIN-${String(item.product).slice(-4).toUpperCase()} | ${item.name}`)
    .join("\n");
  return `${productLines}\nOrderRef: ${orderRef}`;
}

export async function createOrder(req, res, next) {
  try {
    const {
      items,
      shippingAddress,
      paymentMethod = "manual_upi",
      paymentScreenshot,
      paymentNote,
      orderRef,
      customText = "",
      customImages = []
    } = req.body;

    if (!Array.isArray(items) || items.length === 0) return res.status(400).json({ message: "Cart is empty" });
    if (paymentMethod !== "manual_upi") return res.status(400).json({ message: "Manual UPI payment is available right now" });
    if (!paymentScreenshot?.url) return res.status(400).json({ message: "Upload the UPI payment screenshot before placing the order" });

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
      return {
        product: product._id,
        name: product.name,
        image: product.image,
        price: product.price,
        quantity
      };
    });

    const subtotal = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const safeOrderRef = required(orderRef) ? orderRef.trim().slice(0, 24) : buildOrderRef();
    const note = required(paymentNote) ? paymentNote.trim().slice(0, 500) : buildPaymentNote(orderItems, safeOrderRef);
    const payment = createPaymentForOrder(paymentMethod, { amount: subtotal, note, orderRef: safeOrderRef });
    const safeCustomImages = Array.isArray(customImages) ? customImages.filter(Boolean).slice(0, 3) : [];
    const safeCustomText = typeof customText === "string" ? customText.trim().slice(0, 120) : "";
    const order = await Order.create({
      user: req.user._id,
      userDetails: { name: req.user.name, email: req.user.email },
      items: orderItems,
      shippingAddress,
      subtotal,
      totalAmount: subtotal,
      payment,
      paymentMethod,
      paymentStatus: "screenshot_uploaded",
      verificationStatus: "uploaded",
      paymentScreenshot: {
        url: paymentScreenshot.url,
        originalName: paymentScreenshot.originalName || "",
        size: Number(paymentScreenshot.size) || 0,
        uploadedAt: new Date()
      },
      customizationRequested: Boolean(safeCustomText || safeCustomImages.length),
      customText: safeCustomText,
      customImages: safeCustomImages,
      uploadedReferenceImages: safeCustomImages,
      orderStatus: "pending"
    });

    res.status(201).json(order);
  } catch (error) {
    next(error);
  }
}

export async function uploadPaymentScreenshot(req, res, next) {
  try {
    if (!req.file) return res.status(400).json({ message: "Payment screenshot is required" });
    const fileUrl = await uploadImageToCloudinary(req.file, "payment-screenshots", { width: 1200 });
    res.status(201).json({
      url: fileUrl,
      originalName: req.file.originalname,
      size: req.file.size
    });
  } catch (error) {
    next(error);
  }
}

export async function uploadCustomizationImages(req, res, next) {
  try {
    const files = req.files || [];
    if (files.length === 0) return res.status(400).json({ message: "At least one reference image is required" });
    if (files.length > 3) return res.status(400).json({ message: "Upload up to 3 reference images" });
    const urls = await uploadManyImagesToCloudinary(files, "customization-references", { width: 1400 });
    res.status(201).json({ urls });
  } catch (error) {
    await Promise.all((req.files || []).map((file) => cleanupLocalFile(file.path)));
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
    const { orderStatus, status, paymentStatus, verificationStatus, adminNotes } = req.body;
    const nextStatus = orderStatus || status;
    const update = {};
    if (nextStatus) {
      if (!orderStatuses.includes(nextStatus)) return res.status(400).json({ message: "Invalid order status" });
      update.orderStatus = nextStatus;
    }
    if (paymentStatus) {
      if (!paymentStatuses.includes(paymentStatus)) return res.status(400).json({ message: "Invalid payment status" });
      update.paymentStatus = paymentStatus;
      update["payment.status"] = paymentStatus;
    }
    if (verificationStatus) {
      if (!verificationStatuses.includes(verificationStatus)) return res.status(400).json({ message: "Invalid verification status" });
      update.verificationStatus = verificationStatus;
    }
    if (typeof adminNotes === "string") update.adminNotes = adminNotes.trim().slice(0, 1000);
    if (Object.keys(update).length === 0) return res.status(400).json({ message: "No order updates provided" });

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      update,
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
        { $match: { orderStatus: { $ne: "cancelled" }, paymentStatus: { $ne: "payment_rejected" } } },
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
