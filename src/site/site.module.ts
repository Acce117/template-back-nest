import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { SiteController } from "./controllers/site.controller";
import { SiteService } from "./services/site.service";
import { JwtModule } from "@nestjs/jwt";
import jwtConfig from "src/config/jwt.config";
import { UsersModule } from "src/users/users.module";
import { MailerModule } from "@nestjs-modules/mailer";
import { BlackListService } from "./services/blacklist.service";
import { APP_GUARD } from "@nestjs/core";
import { ThrottlerGuard } from "@nestjs/throttler";
import { AuthGuard } from "./guards/auth.guard";
import { MeController } from "./controllers/me.controller";
import { MeService } from "./services/me.service";

@Module({
    controllers: [SiteController, MeController],
    providers: [
        SiteService,
        BlackListService,
        MeService,
        {
            provide: APP_GUARD,
            useClass: ThrottlerGuard,
        },
        // {
        //     provide: APP_GUARD,
        //     useClass: AuthGuard,
        // },
    ],
    imports: [
        ConfigModule,
        UsersModule,
        MailerModule,
        JwtModule.registerAsync({
            imports: [ConfigModule],
            useFactory: jwtConfig,
            inject: [ConfigService],
        }),
    ],
    exports: [BlackListService],
})
export class SiteModule {}
