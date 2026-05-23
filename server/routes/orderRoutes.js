import express from "express";
import {
  analytics,
  createCustomRequest,
  createOrder,
  getMyOrder,
  listCustomRequests,
  listMyOrders,
  listOrders,
  updateCustomRequest,
  updateOrder,
  uploadCustomizationImages,
  uploadPaymentScreenshot
} from "../controllers/orderController.js";
import { adminOnly, protect } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";

const router = express.Router();

router.post("/custom", createCustomRequest);
router.get("/custom", protect, adminOnly, listCustomRequests);
router.patch("/custom/:id", protect, adminOnly, updateCustomRequest);

router.get("/admin/analytics", protect, adminOnly, analytics);
router.get("/", protect, adminOnly, listOrders);
router.post("/customization-images", protect, upload.array("images", 3), uploadCustomizationImages);
router.post("/payment-screenshot", protect, upload.single("screenshot"), uploadPaymentScreenshot);
router.post("/", protect, createOrder);
router.get("/mine", protect, listMyOrders);
router.get("/mine/:id", protect, getMyOrder);
router.patch("/:id", protect, adminOnly, updateOrder);

export default router;
