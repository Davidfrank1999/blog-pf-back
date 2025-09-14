// backend/src/models/Blog.js
import mongoose from "mongoose";

const blogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, index: true },
    excerpt: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    image: { type: String, default: null },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    // canonical status field (preferred)
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    // keep visible boolean (admin can hide/unhide)
    visible: {
      type: Boolean,
      default: true,
    },

    // backwards compatibility: older docs might have `approved: Boolean`
    approved: {
      type: Boolean,
      default: undefined,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Blog", blogSchema);
