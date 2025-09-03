// backend/src/routes/blogRoutes.js
import express from "express";
import {
  createBlog,
  getBlogs,
  getBlog,
  updateBlog,
  deleteBlog,
} from "../controllers/blogControllers.js"; 
import { authMiddleware } from "../middleware/authMiddleware.js";
import upload from "../middleware/upload.js";

const router = express.Router();

// --- Public routes ---
router.get("/", getBlogs);
router.get("/:id", getBlog);

// --- Protected routes ---
router.post("/", authMiddleware, upload.single("image"), createBlog);
router.put("/:id", authMiddleware, upload.single("image"), updateBlog); // ✅ now supports image update
router.delete("/:id", authMiddleware, deleteBlog);

export default router;
