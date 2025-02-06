import { CrudBaseController } from "src/common/controllers/controller";
import { CreateUserDto } from "../dto/create_user.dto";
import { UserService } from "../services/users.service";

export class UserController extends CrudBaseController({
    prefix: "users",
    createDto: CreateUserDto,
    service: UserService,
}) {}
