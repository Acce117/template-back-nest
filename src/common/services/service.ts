import { Injectable, Type } from "@nestjs/common";
import { ICrudService } from "./service.interface";
import { EntityManager } from "typeorm";
import { BaseModel } from "../model/baseModel";
import { BaseRepository } from "../repositories/repository";

export function CrudBaseService<T extends BaseModel>(): Type<ICrudService> {
    @Injectable()
    class CrudService implements ICrudService<T> {
        readonly repository: BaseRepository<T>;

        async getAll(params) {
            return this.repository.getAll( params);
        }

        getById(id, params?) {
            return this.repository.getById(id,  params)
        }

        //TODO
        async exists(params) {
            // const result = await this.repository.selectQuery( params);
            // return result !== null;
            return true;
        }

        async create(data, manager?: EntityManager) {
            return this.repository.create(
                
                data,
                manager
            );
        }

        async update(id: any, data: any, manager?: EntityManager) {
            return this.repository.update(id, data,  manager);
        }

        async delete(id: any, manager?: EntityManager) {
            return this.getById(id, {}).then((e: T) => e.delete(manager));
        }

        dataAmount(params) {
            return this.repository.dataAmount( params);
        }
    }

    return CrudService;
}
