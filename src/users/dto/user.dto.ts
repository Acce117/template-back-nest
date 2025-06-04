import { IsArray, IsEmail, IsOptional, IsString } from "class-validator";

export class UserDto {
    @IsString({
        groups: ["create", "update", "login"],
    })
    @IsOptional({ groups: ["update"] })
    username: string;

    @IsEmail(
        {},
        {
            groups: ["create", "update"],
        },
    )
    @IsOptional({ groups: ["update"] })
    email: string;

    @IsString({
        groups: ["create", "update", "login"],
    })
    @IsOptional({ groups: ["update"] })
    password: string;

    //TODO handle role schema validation
    @IsArray({ groups: ["create", "update"] })
    @IsOptional({ groups: ["update"] })
    roles: Array<any>;
}
