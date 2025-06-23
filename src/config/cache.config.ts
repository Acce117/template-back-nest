import { createKeyv } from "@keyv/redis";
import { CacheModuleOptions } from "@nestjs/cache-manager";

const cacheConfig: CacheModuleOptions = {
    isGlobal: true,
    stores: [createKeyv("redis://localhost:6379")],
};

export default cacheConfig;
