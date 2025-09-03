// backend/src/controllers/blogController.js
import Blog from "../models/Blog.js";

// ✅ Create Blog
export const createBlog = async (req, res) => {
  try {
    const { title, excerpt, content } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : null; // file path from multer

    const blog = await Blog.create({
      title,
      excerpt,
      content,
      image,
      author: req.user.id, // from authMiddleware
    });

    res.status(201).json(blog);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ Get all Blogs
export const getBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find()
      .populate("author", "name email")
      .sort({ createdAt: -1 });
    res.json(blogs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ Get single Blog
export const getBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id).populate("author", "name email");
    if (!blog) return res.status(404).json({ message: "Blog not found" });
    res.json(blog);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ Update Blog
export const updateBlog = async (req, res) => {
  try {
    const { title, excerpt, content } = req.body;
    const updateData = { title, excerpt, content };

    if (req.file) {
      updateData.image = `/uploads/${req.file.filename}`;
    }

    const blog = await Blog.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    res.json(blog);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ Delete Blog
export const deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });
    res.json({ message: "Blog deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
