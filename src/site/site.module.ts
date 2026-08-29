import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { SiteController } from "./controllers/site.controller.js";
import { SiteService } from "./services/site.service.js";
import { JwtModule } from "@nestjs/jwt";
import jwtConfig from "../config/jwt.config.js";
import { UsersModule } from "../users/users.module.js";
import { BlackListService } from "./services/blacklist.service.js";
import { APP_GUARD } from "@nestjs/core";
import { ThrottlerGuard } from "@nestjs/throttler";
import { AuthGuard } from "./guards/auth.guard.js";
import { MeController } from "./controllers/me.controller.js";
import { MeService } from "./services/me.service.js";
import { SendMailModule } from "../mailer/sendMail.module.js";

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
        {
            provide: APP_GUARD,
            useClass: AuthGuard,
        },
    ],
    imports: [
        UsersModule,
        SendMailModule,
        JwtModule.registerAsync({
            useFactory: jwtConfig,
            inject: [ConfigService],
        }),
    ],
    exports: [BlackListService],
})
export class SiteModule {}
