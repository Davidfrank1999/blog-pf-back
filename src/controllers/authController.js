import { validateLoginBody, validateRegisterBody } from "../validators/authValidation.js"
import { User } from "../models/UserModel.js"
import RefreshToken from "../models/RefreshTokenModel.js";

import {verifyRefreshToken } from "../services/tokenServices.js";

import {generateAuthResponse, rotateRefreshToken}from "../services/authService.js";

import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js"

import { asyncHandler } from "../middleware/asyncHandler.js"

export const register =asyncHandler( async (req, res) => {
    const err = validateRegisterBody(req.body);
    if (err) throw new ApiError(400, err);

    // already existing user check
    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) throw new ApiError(400, 'Email already in use');

    // create new user
    const newUser = new User(req.body);
    await newUser.save();
    // generate tokens and response
    const apiResponseData = await generateAuthResponse(res, newUser);
    return res.status(201).json(new ApiResponse(201,"User account Succesfully created",apiResponseData ));
   
});

export const login = asyncHandler(async (req, res) => {
    const err = validateLoginBody(req.body);
    if (err) throw new ApiError(400, err);

    // check user
    const user = await User.findOne({ email: req.body.email }).select('+password');
    if (!user) throw new ApiError(400, 'Invalid email');

    // check password
    const isMatch = await user.comparePassword(req.body.password);
    if (!isMatch) throw new ApiError(400, 'Invalid password');

    // isActive check
    if (!user.isActive) throw new ApiError(403, 'User is not active');

    // generate tokens and response
    const apiResponseData = await generateAuthResponse(res,user);
    return res.status(200).json(new ApiResponse(200,"User succesfully Logedin",apiResponseData ));
});

export const logout = asyncHandler(async (req, res) => {
    const token = req.cookies?.refreshToken || req.body?.refreshToken;
    if (token) {
        res.clearCookie('refreshToken', {
            path: "/api/auth"});
    }  
    const result = await RefreshToken.deleteOne({ token });
    return res.status(200).json(new ApiResponse(200,result.deletedCount ? "Logout successful" : "Token not found"));
});


// Refresh Token Controller
export const refresh = asyncHandler(async (req, res) => {
    const oldRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
    if (!oldRefreshToken) throw new ApiError(401, 'No oldRefreshToken provided');

    // verify oldRefreshToken
    let user;
    try {
        user = await verifyRefreshToken(oldRefreshToken);
    } catch (error) {
        throw new ApiError(401, error.message);
    }
    

    // generate new tokens and response
    const generatedTOken = await rotateRefreshToken(res, user);
    return res.status(200).json(new ApiResponse(200,"Token refreshed successfully", generatedTOken));
    
});
