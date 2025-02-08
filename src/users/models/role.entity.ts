import { Column, Entity, JoinTable, ManyToMany, PrimaryColumn } from "typeorm";
import { Permission } from "./permission.entity";
import { BaseModel } from "src/common/model/baseModel";

@Entity()
export class Role extends BaseModel {
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
