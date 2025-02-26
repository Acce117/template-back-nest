import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { BaseModel } from "../../common/model/baseModel";

@Entity({ name: "blacklist" })
export class BlackListedToken extends BaseModel {
    @PrimaryGeneratedColumn()
    id_token: number;

    @Column()
    token: string;
}
