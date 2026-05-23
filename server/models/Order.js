import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    name: { type: String, required: true, trim: true },
    image: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 }
  },
  { _id: false }
);

const shippingAddressSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    pincode: { type: String, required: true, trim: true }
  },
  { _id: false }
);

const paymentSchema = new mongoose.Schema(
  {
    method: { type: String, enum: ["manual_upi", "razorpay", "stripe", "phonepe", "paypal"], required: true },
    status: { type: String, enum: ["payment_pending", "screenshot_uploaded", "payment_verified", "payment_rejected"], default: "payment_pending" },
    providerOrderId: { type: String, default: null },
    providerPaymentId: { type: String, default: null },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} }
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    userDetails: {
      name: { type: String, required: true, trim: true },
      email: { type: String, required: true, trim: true, lowercase: true }
    },
    items: { type: [orderItemSchema], validate: (items) => items.length > 0 },
    shippingAddress: { type: shippingAddressSchema, required: true },
    subtotal: { type: Number, required: true, min: 0 },
    totalAmount: { type: Number, required: true, min: 0 },
    payment: { type: paymentSchema, required: true },
    paymentMethod: { type: String, enum: ["manual_upi", "razorpay", "stripe", "phonepe", "paypal"], default: "manual_upi", index: true },
    paymentStatus: {
      type: String,
      enum: ["payment_pending", "screenshot_uploaded", "payment_verified", "payment_rejected"],
      default: "payment_pending",
      index: true
    },
    verificationStatus: {
      type: String,
      enum: ["pending", "uploaded", "verified", "rejected"],
      default: "pending",
      index: true
    },
    paymentScreenshot: {
      url: { type: String, default: "" },
      originalName: { type: String, default: "" },
      size: { type: Number, default: 0 },
      uploadedAt: { type: Date, default: null }
    },
    customizationRequested: { type: Boolean, default: false, index: true },
    customText: { type: String, default: "", trim: true, maxlength: 120 },
    customImages: { type: [String], default: [] },
    uploadedReferenceImages: { type: [String], default: [] },
    adminNotes: { type: String, default: "", trim: true },
    orderStatus: {
      type: String,
      enum: ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"],
      default: "pending",
      index: true
    }
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
