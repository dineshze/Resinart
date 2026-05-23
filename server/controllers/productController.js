import Product from "../models/Product.js";
import { cleanupLocalFile, deleteCloudinaryImage, uploadImageToCloudinary } from "../utils/cloudinary.js";

export async function listProducts(req, res) {
  const { category, q } = req.query;
  const filter = {};
  if (category && category !== "All") filter.category = category;
  if (q) filter.name = { $regex: q, $options: "i" };
  const products = await Product.find(filter).sort({ featured: -1, createdAt: -1 });
  res.json(products);
}

export async function getProduct(req, res) {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: "Product not found" });
  res.json(product);
}

export async function createProduct(req, res, next) {
  try {
    const image = req.file ? await uploadImageToCloudinary(req.file, "products", { width: 1600 }) : req.body.image;
    const product = await Product.create({ ...req.body, image });
    res.status(201).json(product);
  } catch (error) {
    await cleanupLocalFile(req.file?.path);
    next(error);
  }
}

export async function updateProduct(req, res, next) {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const oldImage = product.image;
    const image = req.file ? await uploadImageToCloudinary(req.file, "products", { width: 1600 }) : req.body.image || product.image;
    Object.assign(product, { ...req.body, image });
    await product.save();
    if (image !== oldImage) await deleteCloudinaryImage(oldImage);
    res.json(product);
  } catch (error) {
    await cleanupLocalFile(req.file?.path);
    next(error);
  }
}

export async function deleteProduct(req, res, next) {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    await deleteCloudinaryImage(product.image);
    res.json({ message: "Product deleted" });
  } catch (error) {
    next(error);
  }
}
