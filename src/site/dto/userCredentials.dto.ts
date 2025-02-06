import { IsString } from "class-validator";

export class UserCredentials {
    @IsString()
    username: string;

    @IsString()
    password: string;
}
