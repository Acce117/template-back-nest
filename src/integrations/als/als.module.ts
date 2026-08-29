import { Module } from "@nestjs/common";
import { AsyncLocalStorage } from "async_hooks";
import { als } from "./als-instance.js";

@Module({
    providers: [
        {
            provide: AsyncLocalStorage,
            useValue: als,
        },
    ],
    exports: [AsyncLocalStorage],
})
export class ALSModule {}
