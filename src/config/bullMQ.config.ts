import { BullRootModuleOptions } from "@nestjs/bullmq";
import { ConfigService } from "@nestjs/config";

const bullmqConfig = (config: ConfigService): BullRootModuleOptions => {
    return {
        connection: {
            host: config.get("REDIS_HOST"),
            port: config.get<number>("REDIS_PORT"),
        },
    };
};

export default bullmqConfig;
