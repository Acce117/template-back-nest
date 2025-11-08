import { TypeOrmRepository } from "src/common/repositories/typeorm.repository";
import { User } from "../models/user.model";

export class UserRepository extends TypeOrmRepository<User> {
    model = User;
}