import { Module } from "@nestjs/common";
import { SiteModule } from "./site/site.module";
import { CommonModule } from "./common/common.module";
import { ConfigModule, ConfigService } from "@nestjs/config";
import databaseConfig from "./config/database.config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { StreamerModule } from "./fileStreamer/streamer.module";
import { UsersModule } from "./users/users.module";
import { RouterModule } from "@nestjs/core";
import { routes } from "./routes/routes";
import { MailerModule } from "@nestjs-modules/mailer";
import mailerConfig from "./config/mailer.config";
import { ThrottlerModule } from "@nestjs/throttler";
import { BullModule } from "@nestjs/bullmq";
import { SendMailModule } from "./mailer/sendMail.module";
import { throttlerConfig } from "./config/throttler.config";
import { JwtModule } from "@nestjs/jwt";
import { CacheModule } from "@nestjs/cache-manager";
import cacheConfig from "./config/cache.config";
import bullmqConfig from "./config/bullMQ.config";

@Module({
    imports: [
        //config modules
        ConfigModule.forRoot(),
        CacheModule.register(cacheConfig),
        ThrottlerModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: throttlerConfig,
            inject: [ConfigService],
        }),
        MailerModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: mailerConfig,
            inject: [ConfigService],
        }),
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: databaseConfig,
            inject: [ConfigService],
        }),
        BullModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: bullmqConfig,
            inject: [ConfigService],
        }),
        JwtModule,

        //project modules
        SiteModule,
        UsersModule,
        CommonModule,
        StreamerModule.register({
            location: "local",
            base_path: "/uploads",
        }),
        RouterModule.register(routes),
        SendMailModule,
    ],
})
export class AppModule {}
