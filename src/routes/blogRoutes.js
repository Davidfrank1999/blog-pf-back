import { Router } from "express";

import {
  createBlog,
  getBlogs,
  getBlogById,
  updateBlog,
  updateBlogStatus,
  deleteBlog,
  toggleBlogVisibility,
  toggleLike,
  addComment
} from "../controllers/blogControllers.js"; 
import { verifyToken } from "../middleware/authHandler.js";
import upload from "../middleware/upload.js";

const blogRoutes = Router();
/* 
//@TODO: move to utils
// --------------------
// Multer Upload
// --------------------
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });
// --------------------
// Optional Auth
// this is authorization ?
// @TODO: corrections needed
// --------------------
const optionalAuth = async (req, res, next) => {
  if (req.headers.authorization?.startsWith("Bearer ")) {
    return authMiddleware(req, res, next);
  }
  next();
}; */

//Public
blogRoutes.get("/:userId/", getBlogs); //@TODO:  categorize admin, moderator, etc

blogRoutes.get("/:blogIdOrSlug", getBlogById);


// Protected
blogRoutes.get("/getBlogs", getBlogs); //@ToDO: check route

/* blogRoutes.get("/:blogId", getBlogById); */ // @TODO: for protected routr ? combine with above

// owner
blogRoutes.post("/createBlog",verifyToken, upload.single("image"), createBlog);

blogRoutes.put("/:id",verifyToken, upload.single("image"), updateBlog);

blogRoutes.delete("/:id",verifyToken, deleteBlog);

blogRoutes.patch("/:id/visibility", verifyToken, toggleBlogVisibility);


// likes and comments
blogRoutes.post("/:blogId/like", verifyToken, toggleLike);

blogRoutes.post("/:blogId/comment", verifyToken, addComment);

//admin
blogRoutes.patch("/:blogId/status", verifyToken, updateBlogStatus);



export default blogRoutes;
