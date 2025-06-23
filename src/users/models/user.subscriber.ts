import {
    DataSource,
    EntitySubscriberInterface,
    EventSubscriber,
    InsertEvent,
    UpdateEvent,
} from "typeorm";
import { User } from "./user.entity";
import * as bcrypt from "bcrypt";
import { Inject } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@EventSubscriber()
export class UserSubscriber implements EntitySubscriberInterface {
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

    beforeInsert(event: InsertEvent<any>): Promise<any> | void {
        event.entity = this.hashPassword(event.entity);
    }

    beforeUpdate(event: UpdateEvent<any>): Promise<any> | void {
        if (event.entity.password)
            event.entity = this.hashPassword(event.entity);
    }
}
