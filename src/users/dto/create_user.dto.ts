import { IsArray, IsEmail, IsOptional, IsString } from "class-validator";

export class CreateUserDto {
    @IsString()
    username: string;

    @IsEmail()
    email: string;

    @IsString()
    password: string;

    //TODO handle role schema validation
    @IsArray()
    @IsOptional()
    roles: Array<any>;
}
