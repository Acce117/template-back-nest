import {
    BadRequestException,
    Inject,
    Injectable,
    UnauthorizedException,
} from "@nestjs/common";
import * as bcrypt from "bcrypt";
import { JwtService } from "@nestjs/jwt";
import { UserService } from "src/users/services/users.service";
import { User } from "src/users/models/user.entity";
import { MailerService } from "@nestjs-modules/mailer";
import { UserDto } from "src/users/dto/user.dto";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class SiteService {
    @Inject(JwtService) private readonly jwtService: JwtService;
    @Inject(UserService) private readonly userService: UserService;
    @Inject(MailerService) private readonly mailerService: MailerService;
    @Inject(ConfigService) private readonly configService: ConfigService;

    public async signIn(user, manager) {
        const newUser: User = await this.userService.create(user, manager);

        return {
            token: this.jwtService.sign({ id_user: newUser.id_user }),
        };
    }

    public async login(credentials: UserDto) {
        const user: User = await this.userService.getAll({
            where: {
                username: credentials.username,
            },
        })[0];

        if (!user) throw new UnauthorizedException("wrong credentials");
        if (!bcrypt.compareSync(credentials.password, user.password))
            throw new UnauthorizedException("wrong credentials");

        return {
            token: this.jwtService.sign({ id_user: user.id_user }),
        };
    }

    public async forgotPassword(email: string) {
        const user: User = await this.userService.getAll({
            where: { email },
        })[0];

        if (!user) throw new BadRequestException();

        const token = this.jwtService.sign(
            { id_user: user.id_user },
            { expiresIn: "1h" },
        );

        const url =
            this.configService.get("FRONT_BASE_URL") + `resetPassword/${token}`;

        this.mailerService.sendMail({
            to: user.email,
            subject: "Resetting password",
            from: "app_name", //Change and declare as env var
            template: "./email/reset_password",
            context: {
                url,
            },
        });
    }

    public async resetPassword(jwt, password, manager) {
        const id_user = this.jwtService.decode(jwt).id_user;
        return await this.userService.update(id_user, { password }, manager);
    }
}
