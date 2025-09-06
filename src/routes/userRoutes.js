import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { getUserProfile } from "../controllers/userController.js";
import { verfyToken } from "../middleware/authHandler.js";

const userRoutes = Router();

userRoutes.get('/getUserProfile', verfyToken, asyncHandler(getUserProfile));


export default userRoutes ;