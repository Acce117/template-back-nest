import { Inject } from "@nestjs/common";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Cache } from "cache-manager";
import { hashSync } from "bcrypt";
import { ConfigService } from "@nestjs/config";

export class BlackListService {
    @Inject(ConfigService) configService: ConfigService;
    constructor(@Inject(CACHE_MANAGER) readonly cacheManager: Cache) {}

    async isBlacklisted(jwt): Promise<boolean> {
        const hash = hashSync(jwt, this.configService.get("HASH_SALT"));
        return (await this.cacheManager.get<string>(hash)) ? true : false;
    }

    blackListJwt(jwt): Promise<string> {
        const hash = hashSync(jwt, this.configService.get("HASH_SALT"));
        return this.cacheManager.set(hash, jwt);
    }
}
