// backend/src/models/Blog.js
import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

const blogSchema = new mongoose.Schema(
  {
    title:{ type: String, required: true, trim: true },
    slug: { type: String, unique: true, index: true },
    tags:{ type: [String], default: []},
    excerpt: { type: String, required: true },
    content: { type: mongoose.Schema.Types.Mixed, required: true },
    image: { type: String, default: null }, // ✅ image path from multer
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    visibility:{ type: String, enum: ['public', 'private'], default: 'public' },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    comments: [commentSchema],
    approved: { type: Boolean, default: undefined },
  },
  { timestamps: true }
);



export default mongoose.model("Blog", blogSchema);
