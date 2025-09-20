import { Router } from "express";

import { getUserProfile } from "../controllers/userController.js";
import { verifyToken } from "../middleware/authHandler.js";

import { allowedRoles } from "../middleware/authHandler.js";
import { ROLES } from "../constants/roles.js";

const userRoutes = Router();

userRoutes.get('/getUserProfile', verifyToken, getUserProfile);

// protected routes
userRoutes.get('/getallUsers',verifyToken,allowedRoles(ROLES.ADMIN, ROLES.EDITOR)); // example protected route

export default userRoutes ;