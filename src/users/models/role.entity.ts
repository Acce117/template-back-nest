import {
    BaseEntity,
    Column,
    Entity,
    JoinTable,
    ManyToMany,
    PrimaryColumn,
} from "typeorm";
import { Permission } from "./permission.entity";

@Entity()
export class Role extends BaseEntity {
    @PrimaryColumn({ generated: true })
    id_role: number;

    @Column()
    name: string;

    @Column()
    description: string;

    @ManyToMany(() => Permission)
    @JoinTable({
        name: "role_permissions",
        joinColumn: {
            name: "id_role",
            referencedColumnName: "id_role",
        },
        inverseJoinColumn: {
            name: "id_permission",
            referencedColumnName: "id_permission",
        },
    })
    permissions: Permission[];
}
