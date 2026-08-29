import { Inject } from "@nestjs/common";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Cache } from "cache-manager";
import { ConfigService } from "@nestjs/config";

export class BlackListService {
    @Inject(ConfigService) configService: ConfigService;
    constructor(@Inject(CACHE_MANAGER) readonly cacheManager: Cache) {}

    async isBlacklisted(jwt): Promise<boolean> {
        const result = await this.cacheManager.get<string>(jwt);

        return result ? true : false;
    }

    blackListJwt(jwt): Promise<string> {
        return this.cacheManager.set(jwt, "revoked");
    }
}
