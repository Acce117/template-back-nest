import {
    CanActivate,
    ExecutionContext,
    Inject,
    Injectable,
    UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Reflector } from "@nestjs/core";
import { JwtService } from "@nestjs/jwt";
import { IS_PUBLIC_KEY } from "../../common/decorators/isPublic.decorator";
import { BlackListService } from "src/site/services/blacklist.service";

@Injectable()
export class AuthGuard implements CanActivate {
    @Inject(BlackListService)
    private readonly blackListService: BlackListService;

    @Inject(ConfigService) configService: ConfigService;

    constructor(
        private readonly jwtService: JwtService,
        private readonly reflector: Reflector,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        let result = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (!result) {
            const req = context.switchToHttp().getRequest();
            const authorization = req.get("Authorization");

            if (!authorization)
                throw new UnauthorizedException("not provided token");

            try {
                const jwt = authorization.split(" ")[1];

                this.jwtService.verify(jwt, {
                    secret: this.configService.get("JWT_SECRET"),
                });

                result = !(await this.blackListService.isBlacklisted(jwt));
            } catch (err) {
                throw new UnauthorizedException("Token not valid");
            }
        }
        return result;
    }
}
