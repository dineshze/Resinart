import mongoose from "mongoose";

const customRequestSchema = new mongoose.Schema(
  {
    customerName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    productType: { type: String, required: true, trim: true },
    budget: { type: String, trim: true },
    notes: { type: String, required: true, trim: true },
    status: { type: String, enum: ["new", "in-progress", "done"], default: "new" }
  },
  { timestamps: true }
);

export default mongoose.model("CustomRequest", customRequestSchema);
