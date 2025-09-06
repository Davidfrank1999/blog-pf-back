import express from 'express';
import cors from 'cors';
import cookieParser from "cookie-parser";
import helmet from "helmet";

// imports
import connectDB from './config/dbConfig.js';
import { PORT, NODE_ENV, CORS_ORIGIN } from './config/env.js';
import authRoutes from '../routes/authRoutes.js';
import blogRoutes from "../routes/blogRoutes.js";
import userRoutes from '../routes/userRoutes.js';


const app = express();

//Middlewares
app.use(cors({
  origin: CORS_ORIGIN,
  credentials: true,   // needed for cookies
}));
app.use(cookieParser());
app.use(express.json());
app.use(helmet());

// Routes
app.use("/api/auth",authRoutes);
app.use("/api/posts",blogPostRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/user",userRoutes);
app.use("/uploads", express.static("uploads"));


// connect db
connectDB();

// Start server
app.listen(PORT, () => {
    console.log(`Server running in ${NODE_ENV} mode on port ${PORT}`);
});