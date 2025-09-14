import { Body, Controller, Inject, Post, ValidationPipe } from "@nestjs/common";
import { SiteService } from "../services/site.service";
import { JWT } from "../../common/decorators/jwt.decorator";
import { UserDto } from "src/users/dto/user.dto";
import { BlackListService } from "../services/blacklist.service";
import { TransactionHandlerType } from "../../common/utils/transactionHandler";
import { Public } from "../../common/decorators/isPublic.decorator";

@Controller()
export class SiteController {
    @Inject() private readonly blackListService: BlackListService;
    @Inject("transaction-handler") transactionHandler: TransactionHandlerType;

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
    resetPassword(@Body() body, @JWT() jwt) {
        this.transactionHandler.handle(async (manager) => {
            await this.siteService.resetPassword(jwt, body.password, manager);
            return this.blackListService.blackListJwt({ token: jwt });
        });
    }
}
