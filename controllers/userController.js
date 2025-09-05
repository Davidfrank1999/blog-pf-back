import jwt from "jsonwebtoken";
import { User } from "../models/UserModel.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { JWT_ACCESS_SECRET } from "../config/env.js";

export const getUserProfile = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json(new ApiResponse(401, null, "No token provided"));
    }

    const decoded = jwt.verify(token, JWT_ACCESS_SECRET);
    const user = await User.findById(decoded._id);

    if (!user) {
      return res.status(404).json(new ApiResponse(404, null, "User not found"));
    }

    return res.status(200).json(new ApiResponse(200, user, "Profile fetched successfully"));
  } catch (err) {
    return res.status(401).json(new ApiResponse(401, null, "Invalid or expired token"));
  }
};
