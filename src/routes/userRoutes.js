import { Router } from "express";

import { getUserProfile } from "../controllers/userController.js";
import { verfyToken } from "../middleware/authHandler.js";

import { allowedRoles } from "../middleware/authHandler.js";
import { ROLES } from "../constants/roles.js";

const userRoutes = Router();

userRoutes.get('/getUserProfile', verfyToken, getUserProfile);

// protected routes
userRoutes.get('/getallUsers',verfyToken,allowedRoles(ROLES.ADMIN, ROLES.EDITOR)); // example protected route

export default userRoutes ;