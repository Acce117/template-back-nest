import { TypeOrmRepository } from "../../common/repositories/typeorm.repository.js";
import { User } from "../models/user.model.js";

export class UserRepository extends TypeOrmRepository<User> {
    model = User;
}
