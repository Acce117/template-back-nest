import { Inject, Injectable, NotFoundException, Type } from "@nestjs/common";
import { QueryFactory } from "./query-factory";
import { ICrudService } from "./service.interface";
import { EntityManager } from "typeorm";
import { ColumnMetadata } from "typeorm/metadata/ColumnMetadata";
import { BaseModel } from "../model/baseModel";

export interface ServiceOptions {
    model: any;
}

export function CrudBaseService<T extends BaseModel>(
    options: ServiceOptions,
): Type<ICrudService> {
    @Injectable()
    class CrudService implements ICrudService<T> {
        model = options.model;
        @Inject(QueryFactory) readonly queryFactory: QueryFactory;

        async getAll(params) {
            return this.queryFactory
                .selectQuery<T>(this.model, params)
                .getMany();
        }

        getById(id, params?) {
            let query = this.queryFactory.selectQuery<T>(this.model, params);

            const primaryKey: ColumnMetadata[] =
                this.model.getRepository().metadata.primaryColumns[0]
                    .propertyName;

            query = query.where(
                `${this.model.getRepository().metadata.tableName}.${primaryKey} = :id`,
                { id },
            );

            return query.getOne();
        }

        async exists(params) {
            const result = await this.queryFactory.selectQuery(this.model, params);
            return result !== null;
        }

        async create(data, manager?: EntityManager) {
            const element = await this.queryFactory.createQuery(
                this.model,
                data,
            );

            return manager
                .withRepository(this.model.getRepository())
                .save(element);
        }

        async update(id: any, data: any, manager?: EntityManager) {
            const entity = await this.getById(id);

            if (!entity) throw new NotFoundException();

            return manager.update(this.model, id, data);
        }

        async delete(id: any, manager?: EntityManager) {
            return this.getById(id, {}).then((e: T) => e.delete(manager));
        }

        dataAmount(params) {
            return this.queryFactory
                .selectQuery<T>(this.model, params)
                .getCount();
        }
    }

    return CrudService;
}
