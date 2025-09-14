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

// 🔹 Create Blog (user → pending)
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
      status: "pending", // new blogs start as pending
      visible: true,
      author: req.user.id,
    });

    console.log("✅ Blog created:", blog._id, blog.title);
    res.status(201).json({ message: "Blog submitted for review", blog });
  } catch (err) {
    console.error("❌ Create blog error:", err.message);
    res.status(500).json({ message: err.message });
  }
};

// 🔹 Public / Admin: Get blogs
export const getBlogs = async (req, res) => {
  try {
    let filter = { status: "approved", visible: true }; // default for public & users

    // ✅ If logged-in admin → show everything
    if (req.user?.role === "admin") {
      filter = {}; // no restrictions
    }

    const blogs = await Blog.find(filter)
      .populate("author", "name email")
      .sort({ createdAt: -1 });

    console.log("📥 Blogs fetched:", blogs.length);
    res.json(blogs);
  } catch (err) {
    console.error("❌ Get blogs error:", err.message);
    res.status(500).json({ message: err.message });
  }
};

// 🔹 Public: Get single approved + visible blog
export const getBlog = async (req, res) => {
  try {
    const blog = await Blog.findOne({
      _id: req.params.id,
      status: "approved",
      visible: true,
    }).populate("author", "name email");

    if (!blog) return res.status(404).json({ message: "Blog not found" });

    res.json(blog);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 🔹 Admin: Get all blogs (for admin dashboard)
export const getAllBlogs = async (req, res) => {
  try {
    console.log("🔥 Admin fetching all blogs...");
    const blogs = await Blog.find()
      .populate("author", "name email")
      .sort({ createdAt: -1 });

    console.log("📥 Blogs fetched:", blogs.length);
    res.json(blogs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 🔹 Admin: Get single blog (any status)
export const getBlogAdmin = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id).populate(
      "author",
      "name email"
    );
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

    console.log(`✅ Blog ${blog._id} status updated → ${status}`);
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

    console.log(
      `👁️ Blog ${blog._id} visibility → ${blog.visible ? "Visible" : "Hidden"}`
    );
    res.json({ message: `Blog ${blog.visible ? "visible" : "hidden"}`, blog });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 🔹 Delete Blog (Admin or Author)
export const deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    // allow delete by admin or blog owner
    if (req.user.role !== "admin" && blog.author.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await blog.deleteOne();
    res.status(200).json({ message: "Blog deleted successfully" });
  } catch (error) {
    console.error("❌ Delete Blog Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
