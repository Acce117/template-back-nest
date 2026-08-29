import { Global, Module } from "@nestjs/common";
import { UnitOfWorkBuilder } from "./services/uow-builder.service.js";
@Module({
    providers: [UnitOfWorkBuilder],
    exports: [UnitOfWorkBuilder],
})
@Global()
export class CommonModule {}
