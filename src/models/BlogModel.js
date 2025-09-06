// backend/src/models/Blog.js
import mongoose from "mongoose";

const blogSchema = new mongoose.Schema(
  {
    title:{ type: String, required: true, trim: true },
    tags:{ type: [String], default: []},
    excerpt: { type: String, required: true },
    content: { type: String, required: true },
    image: { type: String, default: null }, // ✅ image path from multer
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    visibility:{ type: String, enum: ['public', 'private'], default: 'public' },
  },
  { timestamps: true }
);

export default mongoose.model("Blog", blogSchema);
