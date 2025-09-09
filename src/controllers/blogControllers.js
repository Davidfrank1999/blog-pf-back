// src/controllers/blogController.js
import Blog from "../models/Blog.js";
import slugify from "slugify";

// ✅ Helper: generate a unique slug
const generateSlug = async (title, excludeId = null) => {
  let baseSlug = slugify(title, { lower: true, strict: true });
  let slug = baseSlug;
  let counter = 1;

  // If updating, exclude current blog ID from slug conflict check
  let query = { slug };
  if (excludeId) query._id = { $ne: excludeId };

  while (await Blog.findOne(query)) {
    slug = `${baseSlug}-${counter++}`;
    query.slug = slug;
  }

  return slug;
};

// ✅ Create Blog
export const createBlog = async (req, res) => {
  try {
    const { title, excerpt, content } = req.body;
    if (!title || !excerpt || !content) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const slug = await generateSlug(title);
    const image = req.file ? `/uploads/${req.file.filename}` : null;

    const blog = await Blog.create({
      title,
      excerpt,
      content,
      slug,
      image,
      author: req.user.id, // from authMiddleware
    });

    return res.status(201).json(blog);
  } catch (err) {
    console.error("❌ Create blog error:", err.message);
    return res.status(500).json({ message: "Server error while creating blog" });
  }
};

// ✅ Get all Blogs
export const getBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find()
      .populate("author", "name email")
      .sort({ createdAt: -1 });

    return res.json(blogs);
  } catch (err) {
    console.error("❌ Get blogs error:", err.message);
    return res.status(500).json({ message: "Server error while fetching blogs" });
  }
};

// ✅ Get single Blog
export const getBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id).populate("author", "name email");
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }
    return res.json(blog);
  } catch (err) {
    console.error("❌ Get blog error:", err.message);
    return res.status(500).json({ message: "Server error while fetching blog" });
  }
};

// ✅ Update Blog
export const updateBlog = async (req, res) => {
  try {
    const { title, excerpt, content } = req.body;
    const updateData = { excerpt, content };

    if (title) {
      updateData.title = title;
      updateData.slug = await generateSlug(title, req.params.id);
    }

    if (req.file) {
      updateData.image = `/uploads/${req.file.filename}`;
    }

    const blog = await Blog.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    return res.json(blog);
  } catch (err) {
    console.error("❌ Update blog error:", err.message);
    return res.status(500).json({ message: "Server error while updating blog" });
  }
};

// ✅ Delete Blog
export const deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id);
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }
    return res.json({ message: "Blog deleted successfully" });
  } catch (err) {
    console.error("❌ Delete blog error:", err.message);
    return res.status(500).json({ message: "Server error while deleting blog" });
  }
};
