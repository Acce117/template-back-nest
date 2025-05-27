import { Inject, Injectable, Type } from "@nestjs/common";
import { QueryFactory } from "./query-factory";
import { ICrudService } from "./service.interface";
import { EntityManager } from "typeorm";
import { ColumnMetadata } from "typeorm/metadata/ColumnMetadata";

export interface ServiceOptions {
    model: any;
}

export function CrudBaseService<T>(
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

        getOne(params, id?): Promise<T> {
            let query = this.queryFactory.selectQuery<T>(this.model, params);

            if (id) {
                const primaryKey: ColumnMetadata[] =
                    this.model.getRepository().metadata.primaryColumns[0]
                        .propertyName;

                query = query.andWhere(
                    `${this.model.getRepository().metadata.tableName}.${primaryKey} = :id`,
                    { id },
                );
            }

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

        update(id: any, data: any, manager?: EntityManager) {
            const primaryKey: ColumnMetadata[] =
                this.model.getRepository().metadata.primaryColumns[0]
                    .propertyName;

            const query = manager
                .withRepository(this.model.getRepository())
                .createQueryBuilder()
                .update()
                .set(data)
                .where(`${primaryKey} = :id`, { id });

            return query.execute();
        }

        async delete(id: any, manager?: EntityManager): Promise<any> {
            return this.getOne(id, {}).then((e: any) => e.delete(manager));
        }

        async dataAmount(params) {
            return await this.queryFactory
                .selectQuery(this.model, params)
                .getCount();
        }
    }

    return CrudService;
}
