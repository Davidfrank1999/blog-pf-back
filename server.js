import express from 'express';
import cors from 'cors';


// imports
import connectDB from './config/dbConfig.js';
import { PORT, NODE_ENV, CORS_ORIGIN } from './config/env.js';
import authRoutes from './routes/authRoutes.js';


const app = express();

//Middlewares
app.use(cors({
  origin: CORS_ORIGIN,
  credentials: true,   // needed for cookies
}));

app.use(express.json());

// Routes
app.use("/",authRoutes);


// connect db
connectDB();

// Start server
app.listen(PORT, () => {
    console.log(`Server running in ${NODE_ENV} mode on port ${PORT}`);
});