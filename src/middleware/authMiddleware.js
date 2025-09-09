// backend/src/middleware/authMiddleware.js
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config.js";
import User from "../models/User.js";

export const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // ✅ No token at all
    if (!authHeader) {
      return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    // ✅ Invalid format
    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized: Invalid token format" });
    }

    const token = authHeader.split(" ")[1];

    // ✅ Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ message: "Unauthorized: Invalid or expired token" });
    }

    // ✅ Check if user still exists
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({ message: "Unauthorized: User not found" });
    }

    req.user = { id: user._id, email: user.email, role: user.role };
    next();
  } catch (err) {
    console.error("❌ Auth error:", err.message);
    res.status(500).json({ message: "Internal server error in auth middleware" });
  }
};
