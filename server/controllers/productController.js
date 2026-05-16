import Product from "../models/Product.js";

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

export async function createProduct(req, res) {
  const image = req.file ? `/uploads/${req.file.filename}` : req.body.image;
  const product = await Product.create({ ...req.body, image });
  res.status(201).json(product);
}

export async function updateProduct(req, res) {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: "Product not found" });
  const image = req.file ? `/uploads/${req.file.filename}` : req.body.image || product.image;
  Object.assign(product, { ...req.body, image });
  await product.save();
  res.json(product);
}

export async function deleteProduct(req, res) {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) return res.status(404).json({ message: "Product not found" });
  res.json({ message: "Product deleted" });
}
