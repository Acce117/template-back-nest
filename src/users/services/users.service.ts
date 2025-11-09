import { Inject } from "@nestjs/common";
import { CrudBaseService } from "../../common/services/service";
import { User } from "../models/user.model";
import { UserRepository } from "../repositories/user.repository";
import { BaseRepository } from "src/common/repositories/repository";

export class UserService extends CrudBaseService<User> {
    @Inject(UserRepository) repository: BaseRepository<User>;
}
