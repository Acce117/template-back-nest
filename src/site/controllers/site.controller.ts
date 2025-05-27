import { Body, Controller, Inject, Post } from "@nestjs/common";
import { SiteService } from "../services/site.service";
import { UserCredentials } from "../dto/userCredentials.dto";
import { JWT } from "src/common/decorators/jwt.decorator";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { handleTransaction } from "src/common/utils/handleTransaction";
import { CreateUserDto } from "src/users/dto/create_user.dto";
import { BlackListService } from "../services/blacklist.service";

@Controller()
export class SiteController {
    @InjectDataSource() private readonly dataSource: DataSource;
    @Inject() private readonly blackListService: BlackListService;

    constructor(private readonly siteService: SiteService) {}

    @Post("/login")
    async login(@Body() credentials: UserCredentials) {
        return this.siteService.login(credentials);
    }

    @Post("/sign_in")
    signIn(@Body() user: CreateUserDto) {
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
