import { Controller, Get, Inject } from "@nestjs/common";
import { JWTPayload } from "../../common/decorators/jwt.decorator";
import { DataSource } from "typeorm";
import { MeService } from "../services/me.service";

@Controller("/me")
export class MeController {
    @Inject(MeService) service: MeService;
    dataSource?: DataSource;

    @Get()
    async me(@JWTPayload('id_user') id_user) {
        return await this.service.me(id_user);
    }
}
