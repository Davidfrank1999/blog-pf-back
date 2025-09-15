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
    title: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, index: true },
    excerpt: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    image: { type: String, default: null },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    visible: { type: Boolean, default: true },

    // ✅ Likes
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    // ✅ Comments
    comments: [commentSchema],

    approved: {
      type: Boolean,
      default: undefined,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Blog", blogSchema);
