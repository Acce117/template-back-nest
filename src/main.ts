import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";
import { ToPlainInterceptor } from "./common/interceptors/toPlain.interceptor";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.enableCors();

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
    SwaggerModule.setup("api", app, documentFactory);

    await app.listen(process.env.DOMAIN);
}
bootstrap();
