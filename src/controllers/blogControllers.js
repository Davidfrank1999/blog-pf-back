import Blog from "../models/Blog.js";
import slugify from "slugify";

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

// 🔹 Create Blog (user)
export const createBlog = async (req, res) => {
  try {
    const { title, excerpt, content } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : null;

    const slug = await generateSlug(title);

    const blog = await Blog.create({
      title,
      excerpt,
      content,
      image,
      slug,
      status: "pending", // default = pending until admin approves
      author: req.user.id,
    });

    res.status(201).json({ message: "Blog submitted for review", blog });
  } catch (err) {
    console.error("❌ Create blog error:", err.message);
    res.status(500).json({ message: err.message });
  }
};

// 🔹 Get all approved blogs (public feed)
export const getBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find({ status: "approved" })
      .populate("author", "name email")
      .sort({ createdAt: -1 });

    res.json(blogs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 🔹 Get single blog (only approved)
export const getBlog = async (req, res) => {
  try {
    const blog = await Blog.findOne({ _id: req.params.id, status: "approved" })
      .populate("author", "name email");

    if (!blog) return res.status(404).json({ message: "Blog not found" });
    res.json(blog);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 🔹 Update Blog (only by author)
export const updateBlog = async (req, res) => {
  try {
    const { title, excerpt, content } = req.body;
    const updateData = { title, excerpt, content };

    if (title) {
      updateData.slug = await generateSlug(title);
    }

    if (req.file) {
      updateData.image = `/uploads/${req.file.filename}`;
    }

    const blog = await Blog.findOneAndUpdate(
      { _id: req.params.id, author: req.user.id }, // user can only update their blog
      updateData,
      { new: true }
    );

    if (!blog) return res.status(404).json({ message: "Blog not found or not yours" });

    res.json(blog);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 🔹 Delete Blog (author or admin)
export const deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    if (req.user.role !== "admin" && blog.author.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await blog.deleteOne();
    res.json({ message: "Blog deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 🔹 Approve / Reject Blog (admin only)
export const updateBlogStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!["approved", "rejected", "pending"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const blog = await Blog.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate("author", "name email");

    if (!blog) return res.status(404).json({ message: "Blog not found" });

    res.json({ message: `Blog ${status}`, blog });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 🔹 Admin: get all blogs
export const getAllBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find().populate("author", "name email");
    res.json(blogs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
