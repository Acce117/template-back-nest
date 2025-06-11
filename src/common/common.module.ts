import { Global, Module } from "@nestjs/common";
import { QueryFactory } from "./services/query-factory";
import { FSFileHandler } from "./services/file-handler";
import { TransactionHandler } from "./utils/transactionHandler";

@Module({
    providers: [
        QueryFactory,
        FSFileHandler,
        {
            useClass: TransactionHandler,
            provide: "transaction-handler",
        },
    ],
    exports: [QueryFactory, FSFileHandler, "transaction-handler"],
})
@Global()
export class CommonModule {}
