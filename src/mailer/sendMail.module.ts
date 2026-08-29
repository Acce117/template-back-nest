import { BullModule } from "@nestjs/bullmq";
import { Module } from "@nestjs/common";
import { MailConsumer } from "./services/mail.consumer.js";
import { MailerService } from "./services/mailer.service.js";
import * as nodemailer from "nodemailer";
import { ConfigService } from "@nestjs/config";

@Module({
    providers: [
        MailConsumer,
        MailerService,
        {
            provide: "TRANSPORTER",
            useFactory: (configService: ConfigService) => {
                return nodemailer.createTransport(
                    {
                        host: configService.get("MAILER_HOST"),
                        auth: {
                            user: configService.get("MAILER_USER"),
                            pass: configService.get("MAILER_PASSWORD"),
                        },
                    },
                    {
                        from: {
                            name: "No-reply",
                            address: configService.get("MAILER_FROM"),
                        },
                    },
                );
            },
            inject: [ConfigService],
        },
    ],
    imports: [
        BullModule.registerQueue({
            name: "mails",
            defaultJobOptions: {
                attempts: 3,
                backoff: {
                    type: "exponential",
                    delay: 1000,
                },
            },
        }),
    ],
    exports: [BullModule],
})
export class SendMailModule {}
