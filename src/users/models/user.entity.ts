import { Exclude } from "class-transformer";
import {
    Column,
    DeleteDateColumn,
    Entity,
    JoinTable,
    ManyToMany,
    PrimaryColumn,
} from "typeorm";
import { Role } from "./role.entity";
import { Permission } from "./permission.entity";
import { BaseModel, softDelete } from "src/common/model/baseModel";

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
    @Exclude()
    password: string;

    @DeleteDateColumn()
    @Exclude()
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
