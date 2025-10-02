// backend/src/controllers/blogController.js
import Blog from "../models/BlogModel.js";
import slugify from "slugify";

import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { validateBlogPostBody } from '../validators/blogValidation.js'
import { asyncHandler } from "../middleware/asyncHandler.js";

import path from "path"; //temp delete
import fs  from "fs"; // temp delete

//TODO: move to utils
// 🔹 Helper: generate unique slug
const generateSlug = async (title) => {
  let baseSlug = slugify(title, { lower: true, strict: true });
  let slug = baseSlug;
  let counter = 1;

  while (await Blog.findOne({ slug })) {
    slug = `${baseSlug}-${counter++}`;
  }
  return slug;
};

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

    const slug = await generateSlug(title);
    const image = req.file ? `uploads/${req.file.filename}` : null;
    let formattedTags = [];
    if (tags) {
      if (Array.isArray(tags)) {
        formattedTags = tags.map(t => t.trim());
      } else if (typeof tags === "string") {
        formattedTags = tags.split(",").map(t => t.trim());
      } else {
        throw new ApiError(400, "Invalid tags format");
      }
    }

    const newBlog = await Blog.create({ // .create also saves in db
      title,
      excerpt,

      content,
      slug,
      tags: formattedTags,
      visibility: visibility || "public", // owner control
      status: "pending", // moderation flow
      image,

      author: req.user._id, // from authMiddleware
    });
    
    return res.status(201).json(new ApiResponse(201, "Blog submitted for review", newBlog));
});

//needs editing

// Public routes and private routes

/** 
 * @TODO edit this description
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

  const { userId, tag, search, visibility } = req.query; // optional filter
  const currentUserId = req.user ? req.user.id : null;
  
  let filter = {};
  // If admin → override filters
  if (req.user?.role === "admin") {
    filter = {};
  }

  // User blogs
  if (userId) {
    if (currentUserId && currentUserId === userId) {
      // Owner can see their own blogs
      filter.author = userId;
      if (visibility) filter.visibility = visibility;
    } else {
      // Others can only see public blogs
      filter = { author: userId, visibility: "public", status: "approved" };
    }
  }

  // Tag filter
  if (tag) filter.tags = { $in: [tag] };

  // Search filter
  if (search) {
    const regex = new RegExp(search, "i");
    filter.$or = [{ title: regex }, { excerpt: regex }, { content: regex }];
  }

  const blogs = await Blog.find(filter)
    .populate("author", "name email")
    .populate("comments.user", "name email")
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, "Blogs fetched successfully", blogs));
});

//Get blogs by tags
export const getBlogsByTag = asyncHandler(async(req, res) => {

  const { tags } = req.params; // comma separated tags
  if (!tags) throw new ApiError(400, "Tags parameter is required"); 
  const tagList = tags.split(",").map(t => t.trim());

  const blogsByTag = await Promise.all(tagList.map(async (tag) => {
    const blogs = await Blog.find({ tags: tag, visibility: "public"}) // @TODO: add , approved:true 
      .populate("author", "name email")
      .sort({ createdAt: -1 });
    return { tag, blogs };
  }
  ));

  return res
    .status(200)
    .json(new ApiResponse(200, "Blogs by tags fetched successfully", blogsByTag));
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
  const { blogIdOrSlug } = req.params;
  const currentUserId = req.user ? req.user.id.toString() : null;
  const blog = await Blog.findById(blogIdOrSlug)
    .populate("author", "name email")
    .populate("comments.user", "name email");

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
    //@TODO move to utils and change to cloudinery
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


    // Delete the blog in db
    await Blog.findByIdAndDelete(blogId);

    return res.status(200).json(new ApiResponse(200, "Blog deleted successfully", blog));
});

//@TODO: check these 👇 codes
// 🔹 Toggle Like
export const toggleLike = asyncHandler(async (req, res) => {
  const blog = await Blog.findById(req.params.blogId);
  if (!blog) throw new ApiError(404, "Blog not found");

  const userId = req.user._id.toString();
  if (blog.likes.includes(userId)) {
    blog.likes.pull(userId);
  } else {
    blog.likes.push(userId);
  }

  await blog.save();
  await blog.populate("likes", "name email");

  return res.status(200).json(new ApiResponse(200, "Like toggled", blog.likes));
});

// 🔹 Add Comment
export const addComment = asyncHandler(async (req, res) => {
  const { text } = req.body;
  if (!text) throw new ApiError(400, "Comment text required");

  const blog = await Blog.findById(req.params.blogId);
  if (!blog) throw new ApiError(404, "Blog not found");

  blog.comments.push({ user: req.user._id, text });
  await blog.save();
  await blog.populate("comments.user", "name email");

  return res
    .status(201)
    .json(new ApiResponse(201, "Comment added", blog.comments));
});

// 🔹 Admin: Update Blog Status
export const updateBlogStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!["approved", "rejected", "pending"].includes(status)) {
    throw new ApiError(400, "Invalid status");
  }
  console.log('▶️',req.params.blogId);
  const blog = await Blog.findByIdAndUpdate(
    req.params.blogId,
    { status },
    { new: true }
  ).populate("author", "name email");

  if (!blog) throw new ApiError(404, "Blog not found");

  return res
    .status(200)
    .json(new ApiResponse(200, `Blog ${status}`, blog));
});

// 🔹 Admin: Toggle Blog Visibility
export const toggleBlogVisibility = asyncHandler(async (req, res) => {
  const blog = await Blog.findById(req.params.blogId);
  if (!blog) throw new ApiError(404, "Blog not found");

  blog.visible = !blog.visible;
  await blog.save();

  return res
    .status(200)
    .json(new ApiResponse(200, `Blog ${blog.visible ? "visible" : "hidden"}`, blog));
});