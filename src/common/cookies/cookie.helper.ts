import { Response } from "express";

export const AUTH_COOKIE_NAME = "auth_token";
export const REFRESH_COOKIE_NAME = "refresh_token";

export const COOKIE_MAX_AGE = 7 * 24 * 60 * 60;

export function setAuthCookie(res: Response, { token, refreshToken }): void {
    res.cookie(AUTH_COOKIE_NAME, token, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        path: "/",
        maxAge: COOKIE_MAX_AGE * 1000,
    });

    res.cookie(REFRESH_COOKIE_NAME, refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        path: "/api/refresh",
        maxAge: COOKIE_MAX_AGE * 1000,
    });
}

export function clearAuthCookie(res: Response): void {
    res.clearCookie(AUTH_COOKIE_NAME, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        path: "/",
    });
}
