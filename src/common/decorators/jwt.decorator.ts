import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export function jwtPayload(ctx: ExecutionContext) {
    const request = ctx.switchToHttp().getRequest();
    return request.headers.authorization.split(" ")[1];
}

export const JWT = createParamDecorator((data, ctx) => jwtPayload(ctx));
