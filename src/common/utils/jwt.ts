import { ExecutionContext } from "@nestjs/common";
import { AUTH_COOKIE_NAME } from "../cookies/cookie.helper.js";
import { decode } from "jsonwebtoken";

export function getJwt(ctx: ExecutionContext) {
    const request = ctx.switchToHttp().getRequest();

    const token: string = request.cookies?.[AUTH_COOKIE_NAME];

    return token;
}

export function getJwtPayload(ctx: ExecutionContext) {
    const token = getJwt(ctx);

    return decode(token);
}
