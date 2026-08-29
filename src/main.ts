import { ValidationPipe } from "@nestjs/common";
import { HttpAdapterHost, NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module.js";
import { NestExpressApplication } from "@nestjs/platform-express";
import { ErrorFilter } from "./common/filters/exception.filter.js";

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);
    app.set("query parser", "extended");

    app.enableCors(/** configure as you require */);

    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
        }),
    );

    const httpAdapter = app.get(HttpAdapterHost);
    app.useGlobalFilters(new ErrorFilter(httpAdapter));

    await app.listen(parseInt(process.env.DOMAIN));
}
bootstrap();
