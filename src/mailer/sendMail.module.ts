import { BullModule } from "@nestjs/bullmq";
import { Module } from "@nestjs/common";
import { MailConsumer } from "./services/mail.consumer";
import { MailerModule } from "@nestjs-modules/mailer";

@Module({
    providers: [MailConsumer],
    imports: [
        MailerModule,
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
