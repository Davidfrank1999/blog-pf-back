import { Router } from "express";
import { blogPostCreate } from "../controllers/blogPostController.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { verfyToken } from "../middleware/authHandler.js";

const blogPostRoutes = Router();

//Public

// Protected
blogPostRoutes.post("/createPost",verfyToken, asyncHandler(blogPostCreate));


export default blogPostRoutes;
