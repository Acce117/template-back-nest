import { Controller, Get, Inject } from "@nestjs/common";
import { IController } from "src/common/controllers/controller.interface";
import { JWT } from "src/common/decorators/jwt.decorator";
import { DataSource } from "typeorm";
import { MeService } from "../services/me.service";

@Controller("/me")
export class MeController implements IController {
    @Inject(MeService) service: MeService;
    dataSource?: DataSource;

    @Get()
    async me(@JWT() jwt) {
        return await this.service.me(jwt);
    }
}
