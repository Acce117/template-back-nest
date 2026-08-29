import { Injectable } from "@nestjs/common";
import {
    AbilityBuilder,
    createMongoAbility,
    MongoAbility,
    ExtractSubjectType,
    InferSubjects,
} from "@casl/ability";
import { Action } from "./action.js";
import { User } from "../../modules/users/models/user.model.js";
import { Role } from "../../modules/users/models/role.model.js";
import { Permission } from "../../modules/users/models/permission.model.js";
import { getValue } from "../als/als-instance.js";

type Subjects =
    InferSubjects<typeof User | typeof Role | typeof Permission> | "all";

export type AppAbility = MongoAbility<[Action, Subjects]>;

@Injectable()
export class CaslAbilityFactory {
    createForUser() {
        const { build, can } = new AbilityBuilder(createMongoAbility);

        const userId = getValue("userId");

        can(Action.Read, User, { id: userId });
        can(Action.Update, User, { id: userId });
        can(Action.Delete, User, { id: userId });

        can(Action.Read, Role, { id_role: userId });
        can(Action.Read, Permission, { id_permission: userId });

        return build({
            detectSubjectType: (item) =>
                item.constructor as ExtractSubjectType<Subjects>,
        });
    }
}
