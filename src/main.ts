import { ValidationPipe } from "@nestjs/common";
import { HttpAdapterHost, NestFactory } from "@nestjs/core";
import cookieParser from "cookie-parser";
import { AppModule } from "./app.module.js";
import { NestExpressApplication } from "@nestjs/platform-express";
import { ErrorFilter } from "./common/filters/exception.filter.js";
import helmet from "helmet";

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);
    app.setGlobalPrefix("/api");

    app.set("query parser", "extended");

    app.use(cookieParser());
    app.use(helmet());

    app.enableCors({
        origin: process.env.FRONT_BASE_URL,
        credentials: true,
        methods: ["GET", "POST", "PATCH", "DELETE"],
        maxAge: 3600,
    });

    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
        }),
    );

    const httpAdapter = app.get(HttpAdapterHost);
    app.useGlobalFilters(new ErrorFilter(httpAdapter));

    app.enableShutdownHooks();

    await app.listen(parseInt(process.env.DOMAIN));
}
bootstrap();
