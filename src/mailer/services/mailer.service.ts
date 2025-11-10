import { Inject, Injectable } from "@nestjs/common";
import * as nodemailer from "nodemailer";
import path from "path";
import * as fs from "fs";
import { Data, render, renderFile } from "ejs";
import { ISendMailOptions } from "../types/sendMailOptions";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class MailerService {
    @Inject(ConfigService) private configService: ConfigService;

    @Inject("TRANSPORTER") private transporter: nodemailer.Transporter;

    private async loadTemplate(template: string, data: Data) {
        // const templatesFolderPath = path.join(__dirname, './templates');
        // const templatePath = path.join(templatesFolderPath, template);

        const templateSource = fs.readFileSync(template, 'utf8');
        return render(templateSource, data);
    }

    async sendMail(options: ISendMailOptions) {
        const html = await this.loadTemplate(options.template, options.context);

        await this.transporter.sendMail({
            to: options.to,
            subject: options.subject,
            html: html,
        });
    }
}