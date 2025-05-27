import { Inject, Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UserService } from "src/users/services/users.service";

@Injectable()
export class MeService {
    @Inject(JwtService) jwtService: JwtService;
    @Inject(UserService) userService: UserService;

    public me(jwt) {
        const id_user = this.jwtService.decode(jwt).id_user;
        return this.userService.getOne(
            { relations: ["roles", "permissions"] },
            id_user,
        );
    }
}
