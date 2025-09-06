import { config } from "dotenv";
config({ path: `.env.${process.env.NODE_ENV || 'development'}.local` });

export const PORT = process.env.PORT || 5000;
export const MONGO_URI = process.env.MONGO_URI;

export const NODE_ENV = process.env.NODE_ENV || 'development';
export const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173';

export const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
export const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

export const JWT_ACCESS_EXPIRES = process.env.JWT_ACCESS_EXPIRES || '15m';
export const JWT_REFRESH_EXPIRES = process.env.JWT_REFRESH_EXPIRES || '7d';

export const COOKIE_SECURE = process.env.COOKIE_SECURE;

