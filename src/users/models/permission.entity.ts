import {
    BaseEntity,
    Column,
    DeleteDateColumn,
    Entity,
    PrimaryColumn,
} from "typeorm";

@Entity()
export class Permission extends BaseEntity {
    @PrimaryColumn({ generated: true })
    id_permission: number;

    @Column()
    code: string;

    @Column()
    module: string;

    @Column()
    controller: string;

    @Column()
    action: string;

    @DeleteDateColumn()
    deleted_at: Date;
}
