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
): Type<ICrudService<T>> {
    @Injectable()
    class CrudService implements ICrudService<T> {
        model = options.model;
        @Inject(QueryFactory) readonly queryFactory: QueryFactory;

        async getAll(params): Promise<T[]> {
            return this.queryFactory
                .selectQuery<T>(this.model, params)
                .getMany();
        }

        getOne(id, params?): Promise<T> {
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

        async create(data, manager?: EntityManager): Promise<T> {
            const element = await this.queryFactory.createQuery(
                this.model,
                data,
            );

            return manager
                .withRepository(this.model.getRepository())
                .save(element);
        }

        async update(id: any, data: any, manager?: EntityManager) {
            const entity = await this.getOne(id);

            if (!entity) throw new NotFoundException();

            return manager.update(this.model, id, data);
        }

        async delete(id: any, manager?: EntityManager): Promise<T> {
            return this.getOne(id, {}).then((e: T) => e.delete(manager));
        }

        dataAmount(params) {
            return this.queryFactory
                .selectQuery<T>(this.model, params)
                .getCount();
        }
    }

    return CrudService;
}
