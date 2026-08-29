import { UserDto } from "../../users/dto/user.dto.js";
import { User } from "../../users/models/user.model.js";
import {
    BadRequestException,
    Inject,
    Injectable,
    UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import { InjectQueue } from "@nestjs/bullmq";
import { Queue } from "bullmq";
import * as bcrypt from "bcrypt";
import * as crypto from "crypto";
import { Repository } from "typeorm";

@Injectable()
export class AuthService {
    @Inject(JwtService) private readonly jwtService: JwtService;
    @Inject(ConfigService) private readonly configService: ConfigService;
    @InjectRepository(User) private readonly userRepository: Repository<User>;

    constructor(@InjectQueue("mails") private readonly mailsQueue: Queue) {}

    private generateVerificationCode(): string {
        return crypto.randomInt(100000, 999999).toString();
    }

    private async sendVerificationEmail(
        user: User,
        code: string,
    ): Promise<void> {
        await this.mailsQueue.add("confirm_email", {
            to: user.email,
            subject: "Confirm your email",
            template: "./src/modules/auth/templates/email/confirm_email.ejs",
            context: { code },
        });
    }

    public async signIn(user) {
        const newUser: User = await this.userRepository.create();

        Object.assign(newUser, user);
        newUser.isVerified = false;

        const code = this.generateVerificationCode();
        newUser.verificationCode = code;
        newUser.verificationCodeExpiresAt = new Date(
            Date.now() + 60 * 60 * 1000,
        ); // 1 hour

        await this.userRepository.save(newUser);

        await this.sendVerificationEmail(newUser, code);

        return { message: "Confirmation email sent" };
    }

    public async login(credentials: UserDto) {
        const user: User = await this.userRepository.findOne({
            where: {
                email: credentials.email,
            },
        });

        if (!user) throw new UnauthorizedException("wrong credentials");
        if (!bcrypt.compareSync(credentials.password, user.password))
            throw new UnauthorizedException("wrong credentials");
        if (!user.isVerified)
            throw new UnauthorizedException("Please confirm your email first");

        return {
            user,
            token: this.jwtService.sign({ id: user.id }),
            refreshToken: this.jwtService.sign(
                { id: user.id },
                { expiresIn: "1d" },
            ),
        };
    }

    public async confirmEmail(
        email: string,
        code: string,
    ): Promise<{ message: string }> {
        const user = await this.userRepository.findOne({ where: { email } });

        if (!user) {
            throw new BadRequestException("User not found");
        }

        if (user.isVerified) {
            return { message: "Email already confirmed" };
        }

        if (!user.verificationCode || !user.verificationCodeExpiresAt) {
            throw new BadRequestException(
                "No verification code found. Request a new one.",
            );
        }

        if (user.verificationCode !== code) {
            throw new BadRequestException("Invalid verification code");
        }

        if (new Date() > user.verificationCodeExpiresAt) {
            throw new BadRequestException(
                "Verification code has expired. Request a new one.",
            );
        }

        await this.userRepository.update(user.id, {
            isVerified: true,
            verificationCode: null,
            verificationCodeExpiresAt: null,
        });

        return { message: "Email confirmed successfully" };
    }

    public async resendConfirmation(
        email: string,
    ): Promise<{ message: string }> {
        const user = await this.userRepository.findOne({ where: { email } });

        if (!user || user.isVerified) {
            return {
                message:
                    "If the account exists and is not verified, a confirmation email has been sent.",
            };
        }

        const code = this.generateVerificationCode();
        user.verificationCode = code;
        user.verificationCodeExpiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
        await this.userRepository.save(user);

        await this.sendVerificationEmail(user, code);

        return { message: "Confirmation email resent" };
    }

    public async deleteAccount(userId: number) {
        return this.userRepository.delete(userId);
    }

    public async forgotPassword(email: string) {
        const user: User = await this.userRepository.findOne({
            where: { email },
        });

        if (!user) return;

        const token = this.jwtService.sign(
            { id: user.id },
            { expiresIn: "15m" },
        );

        const url =
            this.configService.get("FRONT_BASE_URL") +
            `/auth/resetpassword?token=${token}`;

        await this.mailsQueue.add("reset_password", {
            to: user.email,
            subject: "Reset your password",
            template: "./src/modules/auth/templates/email/reset_password.ejs",
            context: { url },
        });
    }

    public async resetPassword(userId, password) {
        return await this.userRepository.update(userId, { password });
    }

    public async resetPasswordViaEmail(token: string, password: string) {
        const payload = this.jwtService.verify(token, {
            secret: this.configService.get("JWT_SECRET"),
        });

        if (!payload || !payload.id) {
            throw new BadRequestException("Invalid or expired token");
        }

        await this.userRepository.update(payload.id, { password });
    }

    public async isAuth(token?: string) {
        try {
            if (token) {
                this.jwtService.verify(token, {
                    secret: this.configService.get("JWT_SECRET"),
                });
            }
            return { isAuth: true };
        } catch {
            return { isAuth: false };
        }
    }

    public refreshToken(userId: number) {
        return {
            token: this.jwtService.sign({ id: userId }),
            refreshToken: this.jwtService.sign(
                { id: userId },
                { expiresIn: "1d" },
            ),
        };
    }
}
