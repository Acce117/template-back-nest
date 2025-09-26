import {
    Column,
    DeleteDateColumn,
    Entity,
    JoinTable,
    ManyToMany,
    PrimaryColumn,
} from "typeorm";
import { Role } from "./role.model";
import { Permission } from "./permission.model";
import { BaseModel, softDelete } from "../../common/model/baseModel";

@softDelete
@Entity({ name: "users" })
export class User extends BaseModel {
    @PrimaryColumn({ generated: true })
    id_user: number;

    @Column()
    username: string;

    @Column({ unique: true })
    email: string;

    @Column()
    password: string;

    @DeleteDateColumn()
    deleted_at: Date;

    @ManyToMany(() => Role, { cascade: true })
    @JoinTable({
        name: "users_roles",
        joinColumn: { name: "id_user", referencedColumnName: "id_user" },
        inverseJoinColumn: { name: "id_role", referencedColumnName: "id_role" },
    })
    roles: Role[];

    @ManyToMany(() => Permission)
    @JoinTable({
        name: "users_permissions",
        joinColumn: { name: "id_user", referencedColumnName: "id_user" },
        inverseJoinColumn: {
            name: "id_permission",
            referencedColumnName: "id_permission",
        },
    })
    permissions: Permission[];
}
