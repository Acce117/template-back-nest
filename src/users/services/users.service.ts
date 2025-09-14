import { CrudBaseService } from "../../common/services/service";
import { User } from "../models/user.model";

export class UserService extends CrudBaseService<User>({ model: User }) {}
