import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

export const errorHandler = (err, req, res, next) => {
  console.error(err); // log for debugging

  // Handle custom ApiError
  if (err instanceof ApiError) {
    return res
      .status(err.statusCode)
      .json(new ApiResponse(err.statusCode, err.message));
  }

  // Handle validation errors (if using something like Joi or express-validator)
  if (err.name === 'ValidationError') {
    return res
      .status(400)
      .json(new ApiResponse(400, err.message));
  }

  // Handle other errors (programming or unexpected errors)
  return res
    .status(500)
    .json(new ApiResponse(500, "Internal Server Error"));
};