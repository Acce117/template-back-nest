import {
    BadRequestException,
    Inject,
    Injectable,
    UnauthorizedException,
} from "@nestjs/common";
import * as bcrypt from "bcrypt";
import { JwtService } from "@nestjs/jwt";
import { UserService } from "src/users/services/users.service";
import { User } from "src/users/models/user.model";
import { MailerService } from "@nestjs-modules/mailer";
import { UserDto } from "src/users/dto/user.dto";
import { ConfigService } from "@nestjs/config";
import { InjectQueue } from "@nestjs/bullmq";
import { Queue } from "bullmq";

@Injectable()
export class SiteService {
    @Inject(JwtService) private readonly jwtService: JwtService;
    @Inject(UserService) private readonly userService: UserService;
    @Inject(MailerService) private readonly mailerService: MailerService;
    @Inject(ConfigService) private readonly configService: ConfigService;

    constructor(@InjectQueue('mails') private readonly mailsQueue: Queue) {}

    public async signIn(user, manager) {
        const newUser: User = await this.userService.create(user, manager);

        return {
            token: this.jwtService.sign({ id: newUser.id }),
        };
    }

    public async login(credentials: UserDto) {
        const user: User = (
            await this.userService.getAll({
                where: {
                    username: credentials.username,
                },
            })
        )[0];

        if (!user) throw new UnauthorizedException("wrong credentials");
        if (!bcrypt.compareSync(credentials.password, user.password))
            throw new UnauthorizedException("wrong credentials");

        return {
            token: this.jwtService.sign({ id: user.id }),
        };
    }

    public async forgotPassword(email: string) {
        const user: User = await this.userService.getAll({
            where: { email },
        })[0];

        if (!user) throw new BadRequestException();

        const token = this.jwtService.sign(
            { id: user.id },
            { expiresIn: "1h" },
        );

        const url =
            this.configService.get("FRONT_BASE_URL") + `resetPassword/${token}`;

        this.mailsQueue.add('reset_password', {
            to: user.email,
            subject: "Resetting password",
            from: "app_name", //Change and declare as env var
            template: "./site/templates/email/reset_password",
            context: { url },
        });
    }

    public async resetPassword(userId, password, manager) {
        return await this.userService.update(userId, { password }, manager);
    }
}
