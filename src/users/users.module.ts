import { Module } from "@nestjs/common";
import { UserController } from "./controllers/users.controller";
import { UserService } from "./services/users.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "./models/user.model";
import { Role } from "./models/role.model";
import { Permission } from "./models/permission.model";
import { UserSubscriber } from "./models/user.subscriber";
import { ConfigModule } from "@nestjs/config";

@Module({
    controllers: [UserController],
    providers: [UserService, UserSubscriber],
    exports: [UserService],
    imports: [TypeOrmModule.forFeature([User, Role, Permission]), ConfigModule],
})
export class UsersModule {}
