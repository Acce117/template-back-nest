import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export function jwtPayload(ctx: ExecutionContext) {
    const request = ctx.switchToHttp().getRequest();
    const jwt = request.headers.authorization.split(" ")[1];

    return JSON.parse(atob(jwt.split(".")[1]));
}

export const JwtPayload = createParamDecorator((data, ctx) => jwtPayload(ctx));
