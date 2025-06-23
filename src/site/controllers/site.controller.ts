import { Body, Controller, Inject, Post, ValidationPipe } from "@nestjs/common";
import { SiteService } from "../services/site.service";
import { JWT } from "src/common/decorators/jwt.decorator";
import { UserDto } from "src/users/dto/user.dto";
import { BlackListService } from "../services/blacklist.service";
import { TransactionHandlerType } from "src/common/utils/transactionHandler";

@Controller()
export class SiteController {
    @Inject() private readonly blackListService: BlackListService;
    @Inject("transaction-handler") transactionHandler: TransactionHandlerType;

    constructor(private readonly siteService: SiteService) {}

    @Post("/login")
    async login(
        @Body(new ValidationPipe({ groups: ["login"] }))
        credentials: UserDto,
    ) {
        return this.siteService.login(credentials);
    }

    @Post("/sign_in")
    signIn(@Body(new ValidationPipe({ groups: ["sign-in"] })) user: UserDto) {
        this.transactionHandler.handle((manager) =>
            this.siteService.signIn(user, manager),
        );
    }

    @Post("/forgot-password")
    forgotPassword(@Body("email") email: string) {
        this.siteService.forgotPassword(email);
    }

    @Post("/reset-password")
    resetPassword(@Body() body, @JWT() jwt) {
        this.transactionHandler.handle(async (manager) => {
            await this.siteService.resetPassword(jwt, body.password, manager);
            return this.blackListService.blackListJwt({ token: jwt });
        });
    }
}
