import {
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    JoinTable,
    ManyToMany,
    PrimaryGeneratedColumn,
} from "typeorm";
import { Role } from "./role.model.js";
import { Permission } from "./permission.model.js";
import { BaseModel, softDelete } from "../../../common/model/baseModel.js";

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

    @Column({ name: "profile_img", nullable: true })
    profileImg: string;

    @DeleteDateColumn({ name: "deleted_at" })
    deletedAt: Date;

    @CreateDateColumn({ name: "created_at" })
    createdAt: Date;

    @Column({ name: "is_verified", default: false })
    isVerified: boolean;

    @Column({ name: "verification_code", nullable: true })
    verificationCode: string;

    @Column({
        name: "verification_code_expires_at",
        nullable: true,
    })
    verificationCodeExpiresAt: Date;

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
