import {
    Column,
    DeleteDateColumn,
    Entity,
    JoinTable,
    ManyToMany,
    PrimaryGeneratedColumn,
} from "typeorm";
import { Role } from "./role.model";
import { Permission } from "./permission.model";
import { BaseModel, softDelete } from "../../common/model/baseModel";

@softDelete
@Entity({ name: "users" })
export class User extends BaseModel {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    username: string;

    @Column({ unique: true })
    email: string;

    @Column()
    password: string;

    @Column({ name: 'profile_img', nullable: true } )
    profileImg: string;

    @DeleteDateColumn({ name: 'deleted_at' })
    deletedAt: Date;

    @ManyToMany(() => Role, { cascade: true })
    @JoinTable({
        name: "users_roles",
        joinColumn: { name: "id_user", referencedColumnName: "id" },
        inverseJoinColumn: { name: "id_role", referencedColumnName: "id_role" },
    })
    roles: Role[];

    @ManyToMany(() => Permission)
    @JoinTable({
        name: "users_permissions",
        joinColumn: { name: "id_user", referencedColumnName: "id" },
        inverseJoinColumn: {
            name: "id_permission",
            referencedColumnName: "id_permission",
        },
    })
    permissions: Permission[];
}
