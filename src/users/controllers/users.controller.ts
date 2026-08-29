import { Inject } from "@nestjs/common";
import { CrudBaseController } from "../../common/controllers/controller.js";
import { UserDto } from "../dto/user.dto.js";
import { UserService } from "../services/users.service.js";
import { UserEntity } from "../entities/user.entity.js";

export class UserController extends CrudBaseController({
    prefix: "",
    dto: UserDto,
    entity: UserEntity,
}) {
    @Inject(UserService) service: UserService;
}
