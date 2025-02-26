import { MailerOptions } from "@nestjs-modules/mailer";
import { ConfigService } from "@nestjs/config";
import { EjsAdapter } from "@nestjs-modules/mailer/dist/adapters/ejs.adapter";
import { join } from "path";

const mailerConfig = (config: ConfigService): MailerOptions => {
    return {
        transport: {
            host: config.get("MAILER_HOST"),
            auth: {
                user: config.get("MAILER_USER"),
                pass: config.get("MAILER_PASSWORD"),
            },
        },
        template: {
            dir: "./src/templates",
            adapter: new EjsAdapter(),
        },
    };
};

export default mailerConfig;
