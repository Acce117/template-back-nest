import { createKeyv } from "@keyv/redis";
import { CacheModuleOptions } from "@nestjs/cache-manager";

const redisUrl =
    process.env.REDIS_URL ||
    `redis://${process.env.REDIS_HOST || "localhost"}:${Number(process.env.REDIS_PORT) || 6379}`;

const cacheConfig: CacheModuleOptions = {
    isGlobal: true,
    stores: [createKeyv(redisUrl)],
};

export default cacheConfig;
