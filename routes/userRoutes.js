import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { getUserProfile } from "../controllers/userController.js";

const userRoutes = Router();

userRoutes.get('/getUserProfile', asyncHandler(getUserProfile));


export default userRoutes ;