import { COOKIE_SECURE } from "../config/env.js";

/**
 * Set refresh token cookie
 */
export const setRefreshCookie = (res, token) => {
  const secure = String(COOKIE_SECURE) === "true";
  res.cookie("refreshToken", token, {
    httpOnly: true,
    sameSite: "lax",   // or "strict" if you want extra CSRF protection
    secure,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: "/api/auth"
  });
};

/**
 * Clear refresh token cookie
 */
export const clearRefreshCookie = (res) => {
  res.clearCookie("refreshToken", {
    path: "/api/auth"
  });
};
