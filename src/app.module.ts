import { Module } from "@nestjs/common";
import { SiteModule } from "./site/site.module.js";
import { CommonModule } from "./common/common.module.js";
import { ConfigModule, ConfigService } from "@nestjs/config";
import databaseConfig from "./config/database.config.js";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UsersModule } from "./users/users.module.js";
import { RouterModule } from "@nestjs/core";
import { routes } from "./routes/routes.js";
import { ThrottlerModule } from "@nestjs/throttler";
import { BullModule } from "@nestjs/bullmq";
import { SendMailModule } from "./mailer/sendMail.module.js";
import { throttlerConfig } from "./config/throttler.config.js";
import { JwtModule } from "@nestjs/jwt";
import { CacheModule } from "@nestjs/cache-manager";
import cacheConfig from "./config/cache.config.js";
import bullmqConfig from "./config/bullMQ.config.js";

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

        //project modules
        SiteModule,
        UsersModule,
        CommonModule,
        RouterModule.register(routes),
        SendMailModule,
    ],
})
export class AppModule {}
