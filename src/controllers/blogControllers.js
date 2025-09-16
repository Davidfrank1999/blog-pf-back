// backend/src/controllers/blogController.js
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

// 🔹 Create Blog
export const createBlog = async (req, res) => {
  try {
    const { title, excerpt, content, tags } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : null;
    const slug = await generateSlug(title);

    const blog = await Blog.create({
      title,
      excerpt,
      content,
      image,
      slug,
      tags: tags ? tags.split(",").map((t) => t.trim()) : [],
      status: "pending",
      visible: true,
      author: req.user.id,
    });

    res.status(201).json({ message: "Blog submitted for review", blog });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 🔹 Toggle Like
export const toggleLike = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    const userId = req.user.id;
    if (blog.likes.includes(userId)) {
      blog.likes.pull(userId);
    } else {
      blog.likes.push(userId);
    }

    await blog.save();
    await blog.populate("likes", "name email");

    res.json({ likes: blog.likes });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 🔹 Add Comment
export const addComment = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ message: "Comment text required" });

    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    blog.comments.push({ user: req.user.id, text });
    await blog.save();
    await blog.populate("comments.user", "name email");

    res.status(201).json({ comments: blog.comments });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 🔹 Public / Admin: Get blogs (with search + filters)
export const getBlogs = async (req, res) => {
  try {
    let filter = { status: "approved", visible: true };
    if (req.user?.role === "admin") filter = {};

    // 🏷️ Filter by tag
    if (req.query.tag) {
      filter.tags = { $in: [req.query.tag] };
    }

    // 🔍 Search in title, excerpt, content
    if (req.query.search) {
      const regex = new RegExp(req.query.search, "i"); // case-insensitive
      filter.$or = [
        { title: regex },
        { excerpt: regex },
        { content: regex },
      ];
    }

    const blogs = await Blog.find(filter)
      .populate("author", "name email")
      .populate("comments.user", "name email")
      .sort({ createdAt: -1 });

    res.json(blogs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 🔹 Public: Get single blog (by slug OR ObjectId)
export const getBlog = async (req, res) => {
  try {
    const query = req.params.slugOrId;
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(query);

    const blog = await Blog.findOne(
      isObjectId
        ? { _id: query, status: "approved", visible: true }
        : { slug: query, status: "approved", visible: true }
    )
      .populate("author", "name email")
      .populate("comments.user", "name email");

    if (!blog) return res.status(404).json({ message: "Blog not found" });

    res.json(blog);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 🔹 Admin: Get all blogs
export const getAllBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find()
      .populate("author", "name email")
      .populate("comments.user", "name email")
      .populate("likes", "name email")
      .sort({ createdAt: -1 });

    res.json(blogs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 🔹 Admin: Get single blog (with likes + comments)
export const getBlogAdmin = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id)
      .populate("author", "name email")
      .populate("comments.user", "name email")
      .populate("likes", "name email");

    if (!blog) return res.status(404).json({ message: "Blog not found" });

    res.json(blog);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 🔹 Admin: Approve / Reject
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

// 🔹 Admin: Toggle visibility
export const toggleBlogVisibility = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    blog.visible = !blog.visible;
    await blog.save();

    res.json({ message: `Blog ${blog.visible ? "visible" : "hidden"}`, blog });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 🔹 Delete Blog
export const deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    if (req.user.role !== "admin" && blog.author.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await blog.deleteOne();
    res.status(200).json({ message: "Blog deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
