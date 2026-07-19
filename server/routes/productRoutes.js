import express from "express";
import {
  createCategory,
  createProduct,
  deleteCategory,
  deleteProduct,
  getProduct,
  listCategories,
  listProducts,
  updateProduct
} from "../controllers/productController.js";
import { adminOnly, protect } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";

const router = express.Router();

router.get("/", listProducts);
router.get("/categories", listCategories);
router.get("/:id", getProduct);
router.post("/", protect, adminOnly, upload.single("image"), createProduct);
router.post("/categories", protect, adminOnly, createCategory);
router.put("/:id", protect, adminOnly, upload.single("image"), updateProduct);
router.delete("/:id", protect, adminOnly, deleteProduct);
router.delete("/categories/:id", protect, adminOnly, deleteCategory);

export default router;
