import { Body, Controller, Get, Post } from "@nestjs/common";
import { SiteService } from "../services/site.service";
import { UserCredentials } from "../dto/userCredentials.dto";
import { JwtPayload } from "src/common/decorators/jwtPayload.decorator";
import { instanceToPlain } from "class-transformer";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { handleTransaction } from "src/common/utils/handleTransaction";
import { CreateUserDto } from "src/users/dto/create_user.dto";

@Controller()
export class SiteController {
    @InjectDataSource() private readonly dataSource: DataSource;

    constructor(private readonly siteService: SiteService) {}

    @Post("/login")
    async login(@Body() credentials: UserCredentials) {
        return this.siteService.login(credentials);
    }

    @Post("/sign_in")
    signIn(@Body() user: CreateUserDto) {
        return handleTransaction(
            this.dataSource,
            async (manager) => await this.siteService.signIn(user, manager),
        );
    }

    @Get("/me")
    async me(@JwtPayload() payload) {
        const user = await this.siteService.me(payload.user_id);
        return instanceToPlain(user);
    }
}
