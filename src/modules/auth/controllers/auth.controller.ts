import {
    clearAuthCookie,
    REFRESH_COOKIE_NAME,
    setAuthCookie,
} from "../../../common/cookies/cookie.helper.js";
import {
    Public,
    VerifyToken,
} from "../../../common/decorators/isPublic.decorator.js";
import { JWT, JWTPayload } from "../../../common/decorators/jwt.decorator.js";
import { UnitOfWorkBuilder } from "../../../common/services/uow-builder.service.js";
import { UserDto } from "../../users/dto/user.dto.js";
import {
    Body,
    Controller,
    Delete,
    Get,
    Inject,
    Post,
    Res,
    ValidationPipe,
} from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import { plainToInstance } from "class-transformer";
import { Response } from "express";
import { AuthResponseEntity } from "../entity/auth-response.entity.js";
import { AuthService } from "../services/auth.service.js";
import { ResetPasswordPayloadDto } from "../dto/reset-password.dto.js";
import { BlackListService } from "../services/blacklist.service.js";

@Controller()
export class AuthController {
    @Inject() private readonly blackListService: BlackListService;
    @Inject(UnitOfWorkBuilder) uow: UnitOfWorkBuilder;
    @Inject() private readonly authService: AuthService;

    @Post("/login")
    @Public()
    async login(
        @Body(new ValidationPipe({ groups: ["login"] }))
        credentials: UserDto,
        @Res({ passthrough: true }) res: Response,
    ) {
        const result = await this.authService.login(credentials);
        setAuthCookie(res, {
            token: result.token,
            refreshToken: result.refreshToken,
        });

        return plainToInstance(AuthResponseEntity, { user: result.user });
    }

    @Post("/sign-up")
    @Public()
    async signIn(
        @Body(new ValidationPipe({ groups: ["sign-in"] })) user: UserDto,
    ) {
        return this.authService.signIn(user);
    }

    @Post("/confirm-email")
    @Public()
    async confirmEmail(
        @Body("email") email: string,
        @Body("code") code: string,
    ) {
        return this.authService.confirmEmail(email, code);
    }

    @Post("/resend-confirmation")
    @Public()
    @Throttle({ default: { limit: 1, ttl: 60000 } })
    async resendConfirmation(@Body("email") email: string) {
        return this.authService.resendConfirmation(email);
    }

    @Post("/forgot-password")
    @Public()
    forgotPassword(@Body("email") email: string) {
        return this.authService.forgotPassword(email);
    }

    @Post("/reset-password-via-email")
    @Public()
    async resetPasswordViaEmail(@Body() body: ResetPasswordPayloadDto) {
        return await this.authService.resetPasswordViaEmail(
            body.token,
            body.password,
        );
    }

    @Post("/log-out")
    async logOut(
        @JWT() jwt: string,
        @Res({ passthrough: true }) res: Response,
    ) {
        await this.blackListService.blackListJwt(jwt);
        clearAuthCookie(res);
        return true;
    }

    @Delete("/delete-account")
    async deleteAccount(
        @JWT() jwt: string,
        @JWTPayload("id") userId: number,
        @Res({ passthrough: true }) res: Response,
    ) {
        await this.blackListService.blackListJwt(jwt);
        clearAuthCookie(res);
        return this.authService.deleteAccount(userId);
    }

    @Post("/reset-password")
    resetPassword(@Body() body, @JWTPayload() payload, @JWT() jwt) {
        this.uow.doTransactional(async () => {
            await this.authService.resetPassword(payload.id, body.password);
            return this.blackListService.blackListJwt(jwt);
        });
    }

    @Get("/is-auth")
    @Public()
    isAuth(@JWT() token: string) {
        return token ? this.authService.isAuth(token) : { isAuth: false };
    }

    @Post("/refresh")
    @VerifyToken(REFRESH_COOKIE_NAME)
    async refresh(
        @JWT() token: string,
        @JWTPayload("id") userId: number,
        @Res({ passthrough: true }) res: Response,
    ) {
        await this.blackListService.blackListJwt(token);
        const tokens = this.authService.refreshToken(userId);
        setAuthCookie(res, tokens);
        return tokens;
    }
}
