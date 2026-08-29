import { createParamDecorator, UnauthorizedException } from "@nestjs/common";
import { getJwt, getJwtPayload } from "../utils/jwt.js";

export const JWT = createParamDecorator((data, ctx) => {
    try {
        return getJwt(ctx);
    } catch (err) {
        throw new UnauthorizedException(err);
    }
});

export const JWTPayload = createParamDecorator(
    (attributeToExtract: string, ctx) => {
        let result;
        try {
            const payload = getJwtPayload(ctx);
            if (attributeToExtract) result = payload[attributeToExtract];
            else result = payload;

            return result;
        } catch (err) {
            throw new UnauthorizedException(err);
        }
    },
);
