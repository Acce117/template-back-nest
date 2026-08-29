import { BaseRepository } from "../../../common/repositories/base.repository.js";
import { User } from "../models/user.model.js";
import { EntityManager } from "typeorm";
import { Injectable } from "@nestjs/common";

@Injectable()
export class UserRepository extends BaseRepository<User> {
    constructor(manager: EntityManager) {
        super(User, manager);
    }
}
