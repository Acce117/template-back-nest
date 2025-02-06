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
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: databaseConfig,
            inject: [ConfigService],
        }),
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
