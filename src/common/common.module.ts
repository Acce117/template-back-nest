import { Global, Module } from "@nestjs/common";
import { TypeOrmHandler } from "./handlers/typeOrmHandler.js";
@Module({
    providers: [TypeOrmHandler],
    exports: [TypeOrmHandler],
})
@Global()
export class CommonModule {}
