import { Inject, Injectable } from "@nestjs/common";
import { UserService } from "../../users/services/users.service.js";

@Injectable()
export class MeService {
    @Inject(UserService) userService: UserService;

    public me(id_user) {
        return this.userService.getById(id_user, {
            relations: ["roles", "permissions"],
        });
    }
}
