import { Global, Module } from "@nestjs/common";
import { FSFileHandler } from "./services/file-handler";
import { TypeOrmHandler } from "./handlers/typeOrmHandler";
@Module({
    providers: [
        FSFileHandler,
        TypeOrmHandler,
    ],
    exports: [ FSFileHandler, TypeOrmHandler],
})
@Global()
export class CommonModule {}
