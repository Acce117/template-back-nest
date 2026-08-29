import { MiddlewareConsumer, Module } from "@nestjs/common";
import { AuthModule } from "./modules/auth/auth.module.js";
import { CommonModule } from "./common/common.module.js";
import { ConfigModule, ConfigService } from "@nestjs/config";
import databaseConfig from "./config/database.config.js";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UsersModule } from "./modules/users/users.module.js";
import { ThrottlerModule } from "@nestjs/throttler";
import { BullModule } from "@nestjs/bullmq";
import { SendMailModule } from "./mailer/sendMail.module.js";
import { throttlerConfig } from "./config/throttler.config.js";
import { JwtModule } from "@nestjs/jwt";
import { CacheModule } from "@nestjs/cache-manager";
import cacheConfig from "./config/cache.config.js";
import bullmqConfig from "./config/bullMQ.config.js";
import { ScheduleModule } from "@nestjs/schedule";
import { AsyncLocalStorage } from "async_hooks";
import { Request } from "express";
import { AUTH_COOKIE_NAME } from "./common/cookies/cookie.helper.js";
import { decode } from "jsonwebtoken";
import { CaslModule } from "./integrations/casl/casl.module.js";
import { ALSModule } from "./integrations/als/als.module.js";

@Module({
    imports: [
        //config modules
        ConfigModule.forRoot({ isGlobal: true }),
        CacheModule.register(cacheConfig),
        ThrottlerModule.forRootAsync({
            imports: [],
            useFactory: throttlerConfig,
            inject: [ConfigService],
        }),
        TypeOrmModule.forRootAsync({
            useFactory: databaseConfig,
            inject: [ConfigService],
        }),
        BullModule.forRootAsync({
            useFactory: bullmqConfig,
            inject: [ConfigService],
        }),
        JwtModule,
        ALSModule,
        ScheduleModule.forRoot(),

        //project modules
        AuthModule,
        UsersModule,
        CaslModule,
        CommonModule,
        SendMailModule,
    ],
})
export class AppModule {
    constructor(private readonly als: AsyncLocalStorage<any>) {}

    configure(consumer: MiddlewareConsumer) {
        consumer
            .apply((req: Request, res, next) => {
                const jwt = req.cookies?.[AUTH_COOKIE_NAME];

                const store = new Map<string, any>();

                if (jwt) {
                    const payload = decode(jwt) as { id?: string } | null;

                    if (payload?.id) store.set("userId", payload.id);
                }

                this.als.run(store, () => next());
            })
            .forRoutes("*path");
    }
}
