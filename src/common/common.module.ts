import { Global, Module } from "@nestjs/common";
import { TypeOrmHandler } from "./handlers/typeOrmHandler";
@Module({
    providers: [ TypeOrmHandler ],
    exports: [ TypeOrmHandler],
})
@Global()
export class CommonModule {}
