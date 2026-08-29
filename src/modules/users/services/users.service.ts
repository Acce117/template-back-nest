import { Inject } from "@nestjs/common";
import { CrudBaseService } from "../../../common/services/service.js";
import { User } from "../models/user.model.js";
import { UserRepository } from "../repositories/user.repository.js";

export class UserService extends CrudBaseService<User>() {
    @Inject(UserRepository) readonly repository: UserRepository;
}
