import { Body, Controller, Inject, Post } from "@nestjs/common";
import { SiteService } from "../services/site.service";
import { JWT } from "src/common/decorators/jwt.decorator";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { handleTransaction } from "src/common/utils/handleTransaction";
import { UserDto } from "src/users/dto/user.dto";
import { BlackListService } from "../services/blacklist.service";
import { ValidateDtoPipe } from "src/common/pipes/validateDto.pipe";

@Controller()
export class SiteController {
    @InjectDataSource() private readonly dataSource: DataSource;
    @Inject() private readonly blackListService: BlackListService;

    constructor(private readonly siteService: SiteService) {}

    @Post("/login")
    async login(
        @Body(new ValidateDtoPipe(UserDto, "login")) credentials: UserDto,
    ) {
        return this.siteService.login(credentials);
    }

    @Post("/sign_in")
    signIn(@Body(new ValidateDtoPipe(UserDto, "create")) user: UserDto) {
        return handleTransaction(this.dataSource, (manager) =>
            this.siteService.signIn(user, manager),
        );
    }

    @Post("/forgot-password")
    forgotPassword(@Body("email") email: string) {
        return handleTransaction(this.dataSource, () =>
            this.siteService.forgotPassword(email),
        );
    }

    @Post("/reset-password")
    resetPassword(@Body() body, @JWT() jwt) {
        return handleTransaction(this.dataSource, async (manager) => {
            await this.siteService.resetPassword(jwt, body.password, manager);
            return this.blackListService.create({ token: jwt }, manager);
        });
    }
}
