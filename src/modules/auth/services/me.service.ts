import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "../../users/models/user.model.js";
import { Repository } from "typeorm";

@Injectable()
export class MeService {
    @InjectRepository(User) private readonly userRepository: Repository<User>;

    public me(userId) {
        return this.userRepository.findOne({
            where: {
                id: userId,
            },
            relations: { roles: true, permissions: true },
        });
    }

    public async update(userId: number, data: Partial<User>) {
        await this.userRepository.update(userId, data);
        return this.me(userId);
    }
}
