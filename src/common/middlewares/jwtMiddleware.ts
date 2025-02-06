import {
    Injectable,
    NestMiddleware,
    UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { NextFunction, Request, Response } from "express";

@Injectable()
export class JwtMiddleware implements NestMiddleware {
    constructor(private readonly jwtService: JwtService) {}

    use(req: Request, res: Response, next: NextFunction) {
        const authorization = req.get("Authorization");

        if (!authorization)
            throw new UnauthorizedException("not provided token");

        try {
            const jwt = authorization.split(" ")[1];
            this.jwtService.verify(jwt, { secret: process.env.JWT_SECRET });
            next();
        } catch (err) {
            throw new UnauthorizedException(err.message);
        }
    }
}
