import { ISendMailOptions, MailerService } from "@nestjs-modules/mailer";
import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Inject } from "@nestjs/common";
import { Job } from "bullmq";

@Processor("mails")
export class MailConsumer extends WorkerHost {
    @Inject(MailerService) mailerService: MailerService;

    async process(job: Job<ISendMailOptions, string, string>) {
        try {
            await this.mailerService.sendMail({
                to: job.data.to,
                from: "template@email.com",
                subject: job.data.subject,
                template: job.data.template,
                context: job.data.context,
            });
        } catch (error) {
            console.log(error);
        }
    }
}
