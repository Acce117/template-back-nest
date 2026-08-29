import { SetMetadata } from "@nestjs/common";

export const IS_PUBLIC_KEY = "isPublic";
export const COOKIE_NAME = "cookie_name";

export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
export const VerifyToken = (cookieTokenToVerify) =>
    SetMetadata(COOKIE_NAME, cookieTokenToVerify);
