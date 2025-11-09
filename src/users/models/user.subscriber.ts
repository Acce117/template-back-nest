import {
    DataSource,
    EntitySubscriberInterface,
    EventSubscriber,
    InsertEvent,
    UpdateEvent,
} from "typeorm";
import { User } from "./user.model";
import * as bcrypt from "bcrypt";
import { Inject } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@EventSubscriber()
export class UserSubscriber implements EntitySubscriberInterface<User> {
    @Inject(ConfigService) private readonly configService: ConfigService;

    constructor(dataSource: DataSource) {
        dataSource.subscribers.push(this);
    }
    listenTo() {
        return User;
    }

    private hashPassword(data) {
        data.password = bcrypt.hashSync(
            data.password,
            parseInt(this.configService.get("HASH_SALT")),
        );

        return data;
    }

    beforeInsert(event: InsertEvent<User>): Promise<User> | void {
        event.entity = this.hashPassword(event.entity);
    }

    beforeUpdate(event: UpdateEvent<User>): Promise<User> | void {
        const password_edited = event.updatedColumns.find(
            (c) => c.propertyName === "password",
        );

        if (password_edited) event.entity = this.hashPassword(event.entity);
    }
}
