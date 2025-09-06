// backend/src/controllers/blogController.js
import Blog from "../models/BlogModel.js";
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { validateBlogPostBody } from '../validators/blogPostValidation.js'


export const createBlog = async (req, res) => {
  try {
    /* const { title, content, tags, visibility } = req.body;
    const err = validateBlogPostBody(title);
    if (err) throw new ApiError(400, err */

    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized: user missing" });
    }

    const { title, excerpt, content } = req.body;
    if (!title || !excerpt || !content) {
      return res.status(400).json({ message: "Title, excerpt and content are required" });
    }

    const image = req.file ? `/uploads/${req.file.filename}` : null;

    const blog = await Blog.create({
      title,
      excerpt,
      tags,
      content,
      image,
      visibility,
      author: req.user.id, // from authMiddleware
    });
    await newBlogPost.save()
    return res.status(201).json(new ApiResponse(201, "Blog post create successfully", newBlogPost))

  } catch (err) {
    console.error("❌ Error in createBlog:", err);
    res.status(500).json({ message: "Server error: " + err.message });
  }
};

//needs editing

// ✅ Get all Blogs
export const getBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find()
      .populate("author", "name email")
      .sort({ createdAt: -1 });
    res.json(blogs);
  } catch (err) {
    console.error("❌ Error in getBlogs:", err);
    res.status(500).json({ message: "Server error: " + err.message });
  }
};

// ✅ Get single Blog
export const getBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id).populate("author", "name email");
    if (!blog) return res.status(404).json({ message: "Blog not found" });
    res.json(blog);
  } catch (err) {
    console.error("❌ Error in getBlog:", err);
    res.status(500).json({ message: "Server error: " + err.message });
  }
};

// ✅ Update Blog
export const updateBlog = async (req, res) => {
  try {
    console.log("👉 Updating blog:", req.params.id, req.body);

    const { title, excerpt, content } = req.body;
    const updateData = { title, excerpt, content };

    if (req.file) {
      updateData.image = `/uploads/${req.file.filename}`;
    }

    const blog = await Blog.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    res.json(blog);
  } catch (err) {
    console.error("❌ Error in updateBlog:", err);
    res.status(500).json({ message: "Server error: " + err.message });
  }
};

// ✅ Delete Blog
export const deleteBlog = async (req, res) => {
  try {
    console.log("👉 Deleting blog:", req.params.id);

    const blog = await Blog.findByIdAndDelete(req.params.id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    res.json({ message: "Blog deleted" });
  } catch (err) {
    console.error("❌ Error in deleteBlog:", err);
    res.status(500).json({ message: "Server error: " + err.message });
  }
};
