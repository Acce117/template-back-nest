import { createParamDecorator, ExecutionContext, UnauthorizedException } from "@nestjs/common";
import { decode, verify } from "jsonwebtoken";

export function getJwt(ctx: ExecutionContext) {
    const request = ctx.switchToHttp().getRequest();
    const token = request.headers.authorization.split(" ")[1];

    // verify(token, process.env.JWT_SECRET);

    return token;
}

function getJwtPayload(ctx: ExecutionContext) {
    const token = getJwt(ctx);

    return decode(token);
}

export const JWT = createParamDecorator((data, ctx) => {
    try {
        return getJwt(ctx);
    } catch (err) {
        throw new UnauthorizedException(err);
    }
});

export const JWTPayload = createParamDecorator((attributeToExtract: string, ctx) => {
    let result;
    try {
        const payload = getJwtPayload(ctx);
        if(attributeToExtract) result = payload[attributeToExtract];
        else result = payload;
        
        return result;
    }catch (err) {
        throw new UnauthorizedException(err);
    }
});
