import { IsNotEmpty, IsString } from "class-validator";

export class ResetPasswordPayloadDto {
    @IsNotEmpty()
    @IsString()
    token: string;

    @IsNotEmpty()
    @IsString()
    password: string;
}
