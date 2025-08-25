// services/authService.js
import { signAccessToken, createRefreshToken } from "./tokenServices.js";
import { setRefreshCookie } from "./cookieService.js";
import { ApiResponse } from "../utils/ApiResponse.js";

export const generateAuthResponse = async (res, user, message = "Success", statusCode = 200) => {
    const accessToken = signAccessToken(user);
    const refreshToken = await createRefreshToken(user);
    setRefreshCookie(res, refreshToken);

    return new ApiResponse(statusCode, message, {
        accessToken,
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            roles: user.roles,
        },
    });
};
