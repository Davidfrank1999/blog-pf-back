import express from "express";
import multer from "multer";
import {
  createBlog,
  getBlogs,
  getBlog,
  updateBlog,
  deleteBlog,
  updateBlogStatus,
  getAllBlogs,
} from "../controllers/blogControllers.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// 🔹 Multer setup for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });

// 🔹 Admin-only middleware
const adminMiddleware = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "Forbidden: Admins only" });
  }
  next();
};

// --------------------
// Public Routes
// --------------------
router.get("/", getBlogs);
router.get("/:id", getBlog);

// --------------------
// Authenticated User
// --------------------
router.post("/", authMiddleware, upload.single("image"), createBlog);
router.put("/:id", authMiddleware, upload.single("image"), updateBlog);
router.delete("/:id", authMiddleware, deleteBlog);

// --------------------
// Admin
// --------------------
router.get("/admin/all", authMiddleware, adminMiddleware, getAllBlogs);
router.patch("/:id/status", authMiddleware, adminMiddleware, updateBlogStatus);

export default router;
