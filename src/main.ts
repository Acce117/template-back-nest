import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app.module";
import { ToPlainInterceptor } from "./common/interceptors/toPlain.interceptor";
import { CustomSwaggerModule } from "../../my-swagger-server";
import { NestExpressApplication } from "@nestjs/platform-express";

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);
    app.set('query parser', 'extended');

    app.enableCors(/** configure as you require */);

    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
        }),
    );

    app.useGlobalInterceptors(new ToPlainInterceptor());

    const config = new DocumentBuilder()
        // .setTitle("Cats example")
        // .setDescription("The cats API description")
        // .setVersion("1.0")
        // .addTag("cats")
        .build();

    const documentFactory = () => SwaggerModule.createDocument(app, config);
    CustomSwaggerModule.setup("api", app, documentFactory());

    await app.listen(parseInt(process.env.DOMAIN));
}
bootstrap();
