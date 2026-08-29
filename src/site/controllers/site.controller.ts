import { Body, Controller, Inject, Post, ValidationPipe } from "@nestjs/common";
import { SiteService } from "../services/site.service.js";
import { JWT, JWTPayload } from "../../common/decorators/jwt.decorator.js";
import { UserDto } from "../../users/dto/user.dto.js";
import { BlackListService } from "../services/blacklist.service.js";
import { TransactionHandler } from "../../common/handlers/transactionHandler.js";
import { Public } from "../../common/decorators/isPublic.decorator.js";
import { TypeOrmHandler } from "../../common/handlers/typeOrmHandler.js";

@Controller()
export class SiteController {
    @Inject() private readonly blackListService: BlackListService;
    @Inject(TypeOrmHandler) transactionHandler: TransactionHandler;

    constructor(private readonly siteService: SiteService) {}

    @Post("/login")
    @Public()
    async login(
        @Body(new ValidationPipe({ groups: ["login"] }))
        credentials: UserDto,
    ) {
        return this.siteService.login(credentials);
    }

    @Post("/sign_in")
    @Public()
    signIn(@Body(new ValidationPipe({ groups: ["sign-in"] })) user: UserDto) {
        return this.transactionHandler.handle((manager) =>
            this.siteService.signIn(user, manager),
        );
    }

    @Post("/forgot-password")
    forgotPassword(@Body("email") email: string) {
        this.siteService.forgotPassword(email);
    }

    @Post("/log_out")
    logOut(@JWT() jwt: string) {
        this.blackListService.blackListJwt(jwt);
        return true;
    }

    @Post("/reset-password")
    resetPassword(@Body() body, @JWTPayload() payload, @JWT() jwt) {
        this.transactionHandler.handle(async (manager) => {
            await this.siteService.resetPassword(
                payload.id,
                body.password,
                manager,
            );
            return this.blackListService.blackListJwt({ token: jwt });
        });
    }
}
