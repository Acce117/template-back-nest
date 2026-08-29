import { Injectable } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, LessThan } from "typeorm";
import { User } from "../../users/models/user.model.js";

@Injectable()
export class CleanupService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) {}

    @Cron("0 0 * * *")
    async deleteUnverifiedAccounts(): Promise<void> {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        await this.userRepository.delete({
            isVerified: false,
            createdAt: LessThan(sevenDaysAgo),
        });
    }
}
