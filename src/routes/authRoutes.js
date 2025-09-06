import { Router } from "express";
import { login, logout, refresh, register } from "../controllers/authController.js";


const authRoutes = Router();

authRoutes.post("/register", register);

authRoutes.post("/login", login);

authRoutes.post("/logout", logout);

authRoutes.post("/refresh", refresh);


export default authRoutes;

