import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import { JwtModule } from "@nestjs/jwt";
import { ThrottlerGuard } from "@nestjs/throttler";
import jwtConfig from "../../config/jwt.config.js";
import { SendMailModule } from "../../mailer/sendMail.module.js";
import { UsersModule } from "../users/users.module.js";
import { AuthController } from "./controllers/auth.controller.js";
import { MeController } from "./controllers/me.controller.js";
import { AuthGuard } from "./guards/auth.guard.js";
import { AuthService } from "./services/auth.service.js";
import { CleanupService } from "./services/cleanup.service.js";
import { MeService } from "./services/me.service.js";
import { BlackListService } from "./services/blacklist.service.js";

@Module({
    controllers: [AuthController, MeController],
    providers: [
        AuthService,
        CleanupService,
        MeService,
        AuthGuard,
        BlackListService,
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
})
export class AuthModule {}
