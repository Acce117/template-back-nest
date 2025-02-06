import { Global, Module } from "@nestjs/common";
import { QueryFactory } from "./services/query-factory";
import { FSFileHandler } from "./services/file-handler";

@Module({
    providers: [QueryFactory, FSFileHandler],
    exports: [QueryFactory, FSFileHandler],
})
@Global()
export class CommonModule {}
