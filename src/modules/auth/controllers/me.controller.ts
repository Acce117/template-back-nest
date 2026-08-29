import { Controller, Get, Patch, Body, Inject } from "@nestjs/common";
import { DataSource } from "typeorm";
import { MeService } from "../services/me.service.js";
import { JWTPayload } from "../../../common/decorators/jwt.decorator.js";
import { UserDto } from "../../users/dto/user.dto.js";
import { ValidateDtoPipe } from "../../../common/pipes/validateDto.pipe.js";

@Controller("/me")
export class MeController {
    @Inject(MeService) service: MeService;
    dataSource?: DataSource;

    @Get()
    async me(@JWTPayload("id") userId) {
        return await this.service.me(userId);
    }

    @Patch()
    async update(
        @JWTPayload("id") userId: number,
        @Body(new ValidateDtoPipe(UserDto, "update")) body: Partial<UserDto>,
    ) {
        return await this.service.update(userId, body);
    }
}
