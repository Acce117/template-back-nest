import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { SiteController } from "./controllers/site.controller";
import { SiteService } from "./services/site.service";
import { JwtModule } from "@nestjs/jwt";
import jwtConfig from "src/config/jwt.config";
import { UsersModule } from "src/users/users.module";
import { MailerModule } from "@nestjs-modules/mailer";
import { TypeOrmModule } from "@nestjs/typeorm";
import { BlackListedToken } from "./models/blacklist.entity";
import { BlackListService } from "./services/blacklist.service";

@Module({
    controllers: [SiteController],
    providers: [SiteService, BlackListService],
    imports: [
        ConfigModule,
        UsersModule,
        MailerModule,
        TypeOrmModule.forFeature([BlackListedToken]),
        JwtModule.registerAsync({
            imports: [ConfigModule],
            useFactory: jwtConfig,
            inject: [ConfigService],
        }),
    ],
})
export class SiteModule {}
