import { Injectable } from "@nestjs/common";
import { ICrudService } from "./service.interface";
import { BaseModel } from "../model/baseModel";
import { BaseRepository } from "../repositories/repository";
import { ManagerContainer } from "../handlers/transactionHandler";

@Injectable()
export class CrudBaseService<T extends BaseModel> implements ICrudService<T> {
    readonly repository: BaseRepository<T>;

    async getAll(params) {
        return this.repository.getAll(params);
    }

    getById(id, params?) {
        return this.repository.getById(id, params)
    }

    //TODO
    async exists(params) {
        const result = await this.repository.getAll(params);
        return result.length > 0;
    }

    async create(data, manager?: ManagerContainer) {
        return this.repository.create(
            data,
            manager
        );
    }

    async update(id: any, data: any, manager?: ManagerContainer) {
        return this.repository.update(id, data, manager);
    }

    async delete(id: any, manager?: ManagerContainer) {
        return this.getById(id, {}).then((e: T) => e.delete(manager.manager));
    }

    dataAmount(params) {
        return this.repository.dataAmount(params);
    }
}
