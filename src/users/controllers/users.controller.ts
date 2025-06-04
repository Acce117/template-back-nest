import { CrudBaseController } from "src/common/controllers/controller";
import { UserDto } from "../dto/user.dto";
import { UserService } from "../services/users.service";

export class UserController extends CrudBaseController({
    prefix: "users",
    dto: UserDto,
    service: UserService,
}) {}
