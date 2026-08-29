import { Module } from "@nestjs/common";
import { UserController } from "./controllers/users.controller.js";
import { UserService } from "./services/users.service.js";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "./models/user.model.js";
import { Role } from "./models/role.model.js";
import { Permission } from "./models/permission.model.js";
import { UserSubscriber } from "./models/user.subscriber.js";
import { UserRepository } from "./repositories/user.repository.js";

@Module({
    controllers: [UserController],
    providers: [UserService, UserSubscriber, UserRepository],
    exports: [UserService, TypeOrmModule],
    imports: [TypeOrmModule.forFeature([User, Role, Permission])],
})
export class UsersModule {}
