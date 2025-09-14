import { CrudBaseService } from "../../common/services/service";
import { User } from "../models/user.entity";

export class UserService extends CrudBaseService<User>({ model: User }) {}
