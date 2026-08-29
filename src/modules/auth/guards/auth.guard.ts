import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Reflector } from "@nestjs/core";
import { JwtService } from "@nestjs/jwt";
import {
    COOKIE_NAME,
    IS_PUBLIC_KEY,
} from "../../../common/decorators/isPublic.decorator.js";
import { AUTH_COOKIE_NAME } from "../../../common/cookies/cookie.helper.js";
import { BlackListService } from "../services/blacklist.service.js";

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        private readonly jwtService: JwtService,
        private readonly reflector: Reflector,
        private readonly configService: ConfigService,
        private readonly blackListService: BlackListService,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        let result = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        const cookieTokenToVerify = this.reflector.getAllAndOverride<string>(
            COOKIE_NAME,
            [context.getHandler()],
        );

        if (!result) {
            const req = context.switchToHttp().getRequest();

            const token =
                req.cookies?.[cookieTokenToVerify || AUTH_COOKIE_NAME];

            if (!token) throw new UnauthorizedException("not provided token");

            try {
                this.jwtService.verify(token, {
                    secret: this.configService.get("JWT_SECRET"),
                });

                result = !(await this.blackListService.isBlacklisted(token));
            } catch {
                throw new UnauthorizedException("Token not valid");
            }
        }
        return result;
    }
}
