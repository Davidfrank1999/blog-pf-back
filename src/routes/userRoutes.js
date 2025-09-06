import { Router } from "express";

import { getUserProfile } from "../controllers/userController.js";
import { verfyToken } from "../middleware/authHandler.js";

const userRoutes = Router();

userRoutes.get('/getUserProfile', verfyToken, getUserProfile);


export default userRoutes ;