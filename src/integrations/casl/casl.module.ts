import { Global, Module } from "@nestjs/common";
import { CaslAbilityFactory } from "./casl-ability.factory.js";
import { ALSModule } from "../als/als.module.js";

@Module({
    providers: [CaslAbilityFactory],
    exports: [CaslAbilityFactory],
    imports: [ALSModule],
})
@Global()
export class CaslModule {}
