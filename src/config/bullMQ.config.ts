import { BullRootModuleOptions } from "@nestjs/bullmq";

const bullmqConfig: BullRootModuleOptions = {
    connection: {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT),
    },
};

export default bullmqConfig;
