import { Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import * as bcrypt from "bcrypt";
import { JwtService } from "@nestjs/jwt";
import { UserCredentials } from "../dto/userCredentials.dto";
import { UserService } from "src/users/services/users.service";
import { User } from "src/users/models/user.entity";

@Injectable()
export class SiteService {
    @Inject(JwtService) private readonly jwtService: JwtService;
    @Inject(UserService) private readonly userService: UserService;

    public async signIn(user, manager) {
        const newUser: User = await this.userService.create(user, manager);

        return {
            token: this.generateToken({ id_user: newUser.id_user }),
        };
    }

    public async login(credentials: UserCredentials) {
        const user: User = await this.userService.getOne({
            where: {
                username: credentials.username,
                deleted: 0,
            },
        });

        if (!user) throw new UnauthorizedException("wrong credentials");
        if (!bcrypt.compareSync(credentials.password, user.password))
            throw new UnauthorizedException("wrong credentials");

        return {
            token: this.generateToken({ user_id: user.id_user }),
        };
    }

    public me(id_user) {
        return this.userService.getOne(id_user, {
            relations: ["roles", "permissions"],
        });
    }

    private generateToken(payload: object) {
        return this.jwtService.sign(payload);
    }
}
