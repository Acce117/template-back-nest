import { Exclude } from "class-transformer";

export class UserEntity {
    @Exclude()
    password: string;
    
    @Exclude()
    deleted_at: Date;
}