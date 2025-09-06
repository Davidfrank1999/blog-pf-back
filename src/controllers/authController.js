import { validateLoginBody, validateRegisterBody } from "../validators/authValidation.js"
import { User } from "../models/UserModel.js"
import { ApiError } from "../utils/ApiError.js"
import {verifyRefreshToken } from "../services/tokenServices.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import RefreshToken from "../models/RefreshTokenModel.js";
import {generateAuthResponse}from "../services/authService.js";

export const register = async (req, res) => {
    const err = validateRegisterBody(req.body);
    if (err) throw new ApiError(400, err);

    // already existing user check
    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) throw new ApiError(400, 'Email already in use');

    // create new user
    const newUser = new User(req.body);
    await newUser.save();
    // generate tokens and response
    const apiResponse = await generateAuthResponse(res, newUser);
    return res.status(201).json(apiResponse);
   
};

export const login = async (req, res) => {
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
    const apiResponse = await generateAuthResponse(res,user);
    return res.status(200).json(apiResponse);

};

export const logout = async (req, res) => {
    const token = req.cookies?.refreshToken || req.body?.refreshToken;
    if (token) {
        res.clearCookie('refreshToken', {
            path: "/api/auth"});
    }  
    const result = await RefreshToken.deleteOne({ token });
    return res.status(200).json(new ApiResponse(200,result.deletedCount ? "Logout successful" : "Token not found"));
};


//
export const refresh = async (req, res) => {
    const token = req.cookies?.refreshToken || req.body?.refreshToken;
    if (!token) throw new ApiError(401, 'No refresh token provided');

    // verify refresh token
    let user;
    try {
        user = await verifyRefreshToken(token);
    } catch (error) {
        throw new ApiError(401, error.message);
    }

    // generate new tokens and response
    const apiResponse = await generateAuthResponse(user, res);
    return res.status(200).json(apiResponse);
    
};