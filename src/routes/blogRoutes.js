import { Router } from "express";
/* import { blogPostCreate } from "../controllers/blogPostController.js";
 */
import {
  createBlog,
  getBlogs,
  updateBlog,
  deleteBlog,
  getBlogById,
} from "../controllers/blogControllers.js"; 
import { verfyToken } from "../middleware/authHandler.js";
import upload from "../middleware/upload.js";

const blogRoutes = Router();

//Public
blogRoutes.get("/:userId/", getBlogs);

blogRoutes.get("/:userId/:blogId", getBlogById);


// Protected
blogRoutes.get("/", getBlogs);

blogRoutes.get("/:id", getBlogById);


blogRoutes.post("/createPost",verfyToken, upload.single("image"), createBlog);

blogRoutes.put("/:id",verfyToken, upload.single("image"), updateBlog);

blogRoutes.delete("/:id",verfyToken, deleteBlog);


export default blogRoutes;
