import { BadRequestException } from "@nestjs/common";
import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsArray, IsOptional } from "class-validator";

export class CriteriaDto {
    @IsArray()
    @IsOptional()
    @ApiProperty()
    @Transform(({ value }) => {
        if (typeof value === "string") return [value];
        return value;
    })
    select: string[];

    @IsArray()
    @IsOptional()
    @ApiProperty()
    @Transform(({ value }) => {
        if (typeof value === "string") return [value];
        return value;
    })
    relations: string[];

    @IsOptional()
    @ApiProperty()
    @Transform(
        ({ value }) => {
            try {
                value = JSON.parse(value);
            } catch {
                throw new BadRequestException(
                    "where property must be an object",
                );
            }
            return value;
        },
        {
            toClassOnly: true,
        },
    )
    where: object;

    @IsOptional()
    @ApiProperty()
    @Transform(
        ({ value }) => {
            if (typeof value === "string") {
                if (/^\d+$/.test(value)) value = parseInt(value);
            } else if (typeof value !== "number")
                throw new BadRequestException("Limit must be a numeric value");
            return value;
        },
        {
            toClassOnly: true,
        },
    )
    limit: number;

    @IsOptional()
    @ApiProperty()
    @Transform(
        ({ value }) => {
            if (typeof value === "string") {
                if (/^\d+$/.test(value)) value = parseInt(value);
            } else if (typeof value !== "number")
                throw new BadRequestException("Limit must be a numeric value");

            return value;
        },
        {
            toClassOnly: true,
        },
    )
    offset: number;

    @IsOptional()
    @ApiProperty()
    order: any;
}
