import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
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
import { JwtMiddleware } from "./common/middlewares/jwtMiddleware";
import { BullModule } from "@nestjs/bullmq";
import { SendMailModule } from "./mailer/sendMail.module";
import { throttlerConfig } from "./config/throttler.config";
import { JwtModule } from "@nestjs/jwt";
import { CacheModule } from "@nestjs/cache-manager";
import cacheConfig from "./config/cache.config";

@Module({
    imports: [
        //project modules
        SiteModule,
        UsersModule,
        CommonModule,
        StreamerModule.register({
            location: "local",
            base_path: "/uploads",
        }),
        RouterModule.register(routes),

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
        BullModule.forRoot({
            connection: {
                host: "localhost",
                port: 6379,
            },
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
export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        /**
        consumer
            .apply(JwtMiddleware)
            .exclude(
                { path: 'login', method: RequestMethod.POST },
                { path: 'sign_in', method: RequestMethod.POST },
            )
         */
    }
}
