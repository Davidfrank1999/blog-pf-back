// services/authService.js
import { signAccessToken, createRefreshToken } from "./tokenServices.js";
import { setRefreshCookie } from "./cookieService.js";


export const generateAuthResponse = async (res, newUser) => {
    const accessToken = signAccessToken(newUser);
    const refreshToken = await createRefreshToken(newUser);
    setRefreshCookie(res, refreshToken);

    return {
        accessToken:accessToken,
        user: {
            id: newUser._id,
            name: newUser.name,
            email: newUser.email,
            roles: newUser.roles,
        },
    };
};

export const rotateRefreshToken = async (res, user) => {
    const accessToken = signAccessToken(user);
    const refreshToken = await createRefreshToken(user);
    setRefreshCookie(res, refreshToken);

    return {accessToken:accessToken};
}
