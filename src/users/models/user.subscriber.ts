import {
    DataSource,
    EntitySubscriberInterface,
    EventSubscriber,
    InsertEvent,
    UpdateEvent,
} from "typeorm";
import { User } from "./user.entity";
import * as bcrypt from "bcrypt";

@EventSubscriber()
export class UserSubscriber implements EntitySubscriberInterface {
    constructor(dataSource: DataSource) {
        dataSource.subscribers.push(this);
    }
    listenTo() {
        return User;
    }

    private hashPassword(data) {
        data.password = bcrypt.hashSync(
            data.password,
            parseInt(process.env.HASH_SALT),
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
