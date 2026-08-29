import { Type } from "class-transformer";
import { UserEntity } from "../../users/entities/user.entity.js";

export class AuthResponseEntity {
    @Type(() => UserEntity)
    user: UserEntity;
}
