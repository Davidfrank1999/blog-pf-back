import jwt from 'jsonwebtoken';
import { ApiError } from '../utils/ApiError.js';
import { JWT_ACCESS_SECRET } from '../config/env.js';

export const verifyToken = (req, res, next) => {
    const header = req.headers['authorization'];
    const token = header?.startsWith('Bearer ') ? header.split(' ')[1] : null;
    if (!token) throw new ApiError(401,'Access denied. No token provided.'); 
    
    try {
        const payload = jwt.verify(token, JWT_ACCESS_SECRET);
        req.user = payload; // Attach user info to request object
        next();
    } catch {
        throw new ApiError(401,'Invalid token.');
    }
};

export const allowedRoles = (...allowedRoles) => (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
        throw new ApiError(403,'Forbidden. You do not have the required permissions.');
    }
    next();
}
