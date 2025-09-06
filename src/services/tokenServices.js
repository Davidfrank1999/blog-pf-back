import {JWT_ACCESS_SECRET, JWT_ACCESS_EXPIRES, JWT_REFRESH_EXPIRES} from "../config/env.js";
import RefreshToken from "../models/RefreshTokenModel.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import ms from "ms";

/**
 * Generate access token
 */
export const signAccessToken = (user) => {
    // Implementation here
    return jwt.sign(
        {_id: user._id, email: user.email, roles: user.roles},
        JWT_ACCESS_SECRET,
        {expiresIn: JWT_ACCESS_EXPIRES || '15m'}
    )
};

// @TODO: verification is also in middleware/authhandler.js, 
// .. import this there or delet this       
/**
 * Verify access token 
 */
export const verifyAccessToken = (token) => {
    return jwt.verify(token, JWT_ACCESS_SECRET);
};

/**
 * Generate refresh token and save it in DB
 */
export const createRefreshToken = async (user) => {
    const refreshToken = crypto.randomBytes(40).toString('hex');
    const ttl = JWT_REFRESH_EXPIRES || '7d';
    const expiresAt = new Date(Date.now() + ms(ttl));
    
    await RefreshToken.create({
        user: user._id,
        refreshToken: refreshToken,
        expiresAt
    });
    return refreshToken;
};

/**
 * Verify refresh token and revoke
 */
export const verifyRefreshToken = async (oldRefreshToken) => {
    const storedToken = await RefreshToken.findOne({ refreshToken:oldRefreshToken, revoked: false }).populate('user');
    
    if (!storedToken || storedToken.expiresAt < new Date()) {
        throw new Error('Invalid or expired refresh token');
    } 
    // revoke old Token

    storedToken.revoked = true;
    await storedToken.save();
    return storedToken.user;
};  
