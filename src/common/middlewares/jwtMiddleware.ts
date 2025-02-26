import {
    Inject,
    Injectable,
    NestMiddleware,
    UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { NextFunction, Request, Response } from "express";
import { BlackListService } from "src/site/services/blacklist.service";

@Injectable()
export class JwtMiddleware implements NestMiddleware {
    @Inject(BlackListService)
    private readonly blackListService: BlackListService;

    constructor(private readonly jwtService: JwtService) {}

    async use(req: Request, res: Response, next: NextFunction) {
        const authorization = req.get("Authorization");

        if (!authorization)
            throw new UnauthorizedException("not provided token");

        try {
            const jwt = authorization.split(" ")[1];
            this.jwtService.verify(jwt, { secret: process.env.JWT_SECRET });

            next();
        } catch (err) {
            next(err);
        }
    }

    private async verifyBlackList(token) {
        const result = await this.blackListService.getOne({
            where: { token },
        });

        if (!result) throw new UnauthorizedException("Token not valid");
    }
}
