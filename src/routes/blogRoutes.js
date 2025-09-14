import express from "express";
import multer from "multer";
import {
  createBlog,
  getBlogs,
  getBlog,
  updateBlogStatus,
  deleteBlog,
  getAllBlogs,
  toggleBlogVisibility,
  getBlogAdmin,
} from "../controllers/blogControllers.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

// ✅ Optional auth wrapper (for public routes)
const optionalAuth = async (req, res, next) => {
  if (req.headers.authorization?.startsWith("Bearer ")) {
    return authMiddleware(req, res, next);
  }
  next();
};

// --------------------
// Admin routes (must come before public `:id`)
// --------------------
const adminMiddleware = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "Forbidden: Admins only" });
  }
  next();
};

router.get("/admin/all", authMiddleware, adminMiddleware, getAllBlogs);
router.get("/admin/:id", authMiddleware, adminMiddleware, getBlogAdmin);
router.patch("/:id/status", authMiddleware, adminMiddleware, updateBlogStatus);
router.patch("/:id/visibility", authMiddleware, adminMiddleware, toggleBlogVisibility);

// --------------------
// Public/User/Admin routes
// --------------------
router.get("/", optionalAuth, getBlogs); // ✅ now admin sees everything
router.get("/:id", getBlog);

// --------------------
// Authenticated user routes
// --------------------
router.post("/", authMiddleware, upload.single("image"), createBlog);
router.delete("/:id", authMiddleware, deleteBlog);

export default router;
