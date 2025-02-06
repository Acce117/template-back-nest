import { CrudBaseService } from "src/common/services/service";
import { User } from "../models/user.entity";

export class UserService extends CrudBaseService({ model: User }) {}
