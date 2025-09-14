import { Inject } from "@nestjs/common";
import { CrudBaseController } from "../../common/controllers/controller";
import { UserDto } from "../dto/user.dto";
import { UserService } from "../services/users.service";
import { UserEntity } from "../entities/user.entity";

export class UserController extends CrudBaseController({
    prefix: "users",
    dto: UserDto,
    entity: UserEntity,
}) {
    @Inject(UserService) service: UserService;
}
