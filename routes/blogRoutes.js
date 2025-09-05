import { Router } from "express";
/* import { blogPostCreate } from "../controllers/blogPostController.js";
 */
import {
  createBlog,
  getBlogs,
  getBlog,
  updateBlog,
  deleteBlog,
} from "../controllers/blogControllers.js"; 
import { asyncHandler } from "../middleware/asyncHandler.js";
import { verfyToken } from "../middleware/authHandler.js";
import upload from "../middleware/upload.js";

const blogRoutes = Router();

//Public
blogRoutes.get("/", getBlogs);

blogRoutes.get("/:id", getBlog);


// Protected
blogRoutes.post("/createPost",verfyToken, upload.single("image"), createBlog);

blogRoutes.put("/:id",verfyToken, upload.single("image"), updateBlog);

blogRoutes.delete("/:id",verfyToken, deleteBlog);


export default blogRoutes;
