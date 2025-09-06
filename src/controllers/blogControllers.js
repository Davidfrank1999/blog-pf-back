// backend/src/controllers/blogController.js
import Blog from "../models/BlogModel.js";
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { validateBlogPostBody } from '../validators/blogValidation.js'
import { asyncHandler } from "../middleware/asyncHandler.js";

import path from "path"; //temp delete
import fs  from "fs"; // temp delete

// Protected routes
export const createBlog = asyncHandler(async (req, res) => {

    if (!req.user || !req.user._id) {
      throw new ApiError(400, "Unauthorized: user missing")
    }
   
    const blogData = JSON.parse(req.body.data || "{}");
    if (!blogData) throw new ApiError(400, "Blog data is required");
    const { title, excerpt, content, tags, visibility } = blogData;
    // Validate fields
    const err = validateBlogPostBody({ title, excerpt, content, visibility });
    if (err) throw new ApiError(400, err);

    const image = req.file ? `uploads/${req.file.filename}` : null;

    const newBlog = await Blog.create({ // .create also saves in db
      title,
      excerpt,
      tags,
      content,
      image,
      visibility,
      author: req.user._id, // from authMiddleware
    });
    
    return res.status(201).json(new ApiResponse(201, "Blog post create successfully", newBlog));
});

//needs editing

// Public routes and private routes

/**
 * @route GET /api/users/:userId/blogs
 * @desc Get blogs of a specific user
 * - If the logged-in user requests their own blogs, return both public and private.
 * - If requesting another user’s blogs, return only public ones.
 * @access Public (own blogs require auth)
 * @param {string} userId - User ID whose blogs to fetch
 * @param {string} [visibility] - Optional ("public" | "private"), only works if requesting own blogs
 * @return {Array} List of blogs with author details populated
 */
export const getBlogs = asyncHandler(async(req, res) => {

  const { userId } = req.query; // optional filter
  const currentUserId = req.user ? req.user.id : null;
  const { visibility } = req.body; // optional filter when owner requests their blogs

  // Build filter
  let filter = {};
  if (userId) {
    if (currentUserId && currentUserId.toString() === userId) {
      // Owner: can see their own blogs (with optional visibility filter)
      filter.author = userId;
      if (visibility) filter.visibility = req.body.visibility; // "public" or "private"
    } else {
      // Other people: only see public blogs
      filter = { author: userId, visibility: "public" };
    }
  } else {
    // No userId: show all public blogs
    filter = { visibility: "public" };
  }

  const blogs = await Blog.find(/* filter */)
    .populate("author", "name email")
    .sort({ createdAt: -1 });
  
    return res.status(200).json(new ApiResponse(200, "Blogs fetched successfully", blogs));
});


// Get single Blog
/**
 * @route GET /api/blogs/:blogId
 * @desc Fetch a single blog by ID
 * - Public blogs: accessible to anyone
 * - Private blogs: only accessible by the author
 * @access Public (author required for private)
 * @param {string} blogId - Blog ID to fetch
 * @return {Object} Blog document with author populated
 */
export const getBlogById = asyncHandler(async (req, res) => {
  const { blogId } = req.params;
  const currentUserId = req.user ? req.user.id : null;

  const blog = await Blog.findById(blogId).populate("author", "name email");
  if (!blog) throw new ApiError(404,"Blog not found");

  // @TODO: check this filter condition
  if (
    blog.visibility === "private" &&
    (!currentUserId || blog.author._id.toString() !== currentUserId.toString())
  ) {
    throw new ApiError(403, "You are not authorized to view this blog");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Blog fetched successfully", blog));
  
});

// Update Blog
export const updateBlog = asyncHandler(async (req, res) => {
  console.log("👉 Updating blog:", req.params.id, req.body); //console

  const { id: blogId } = req.params;

  const currentUserId = req.user?._id;
  if (!currentUserId) throw new ApiError(401, "Unauthorized");
  // Find the blog first
  const blog = await Blog.findById(blogId);
  if (!blog) throw new ApiError(404, "Blog not found");

  // Only author can update
  if (blog.author.toString() !== currentUserId.toString()) {
    throw new ApiError(403, "You are not allowed to update this blog");
  }

  // Update fields
  const blogData = req.body.data ? JSON.parse(req.body.data) : req.body;
  const { title, excerpt, content, tags, visibility } = blogData;

  if (title !== undefined) blog.title = title;
  if (excerpt !== undefined) blog.excerpt = excerpt;
  if (content !== undefined) blog.content = content;
  if (tags !== undefined) blog.tags = tags;
  if (visibility !== undefined) blog.visibility = visibility;

  // Update image if uploaded
  if (req.file) {
    blog.image = `/uploads/${req.file.filename}`;
  }

  const updatedBlog = await blog.save();

  return res
    .status(200)
    .json({ message: "Blog updated successfully", blog: updatedBlog });
  
});

// Delete Blog
export const deleteBlog = asyncHandler(async (req, res) => {
    const blogId = req.params.id;
    const currentUserId = req.user?._id;

    if (!currentUserId) throw new ApiError(401, "Unauthorized");

    // Find the blog first
    const blog = await Blog.findById(blogId);
    if (!blog) throw new ApiError(404, "Blog not found");

    // Only author can delete
    if (blog.author.toString() !== currentUserId.toString()) {
        throw new ApiError(403, "You are not allowed to delete this blog");
    }

    // Delete uploaded image if exists
    if (blog.image) {
        const imagePath = path.join(process.cwd(), blog.image); // absolute path
        fs.unlink(imagePath, (err) => {
            if (err) {
                console.warn(`Failed to delete image: ${imagePath}`, err.message);
            } else {
                console.log(`Deleted image: ${imagePath}`);
            }
        });
    }


    // Delete the blog
    await Blog.findByIdAndDelete(blogId);

    return res.status(200).json(new ApiResponse(200, "Blog deleted successfully", blog));
});
