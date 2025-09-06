
import { User } from "../models/UserModel.js";
import { ApiResponse } from "../utils/ApiResponse.js";

import { asyncHandler } from "../middleware/asyncHandler.js";

export const getUserProfile = asyncHandler(async (req, res) => {

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json(new ApiResponse(404, null, "User not found"));
    }

    return res.status(200).json(new ApiResponse(200, user, "Profile fetched successfully"));
  
});
