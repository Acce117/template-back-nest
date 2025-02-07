import { Inject, Injectable, Type } from "@nestjs/common";
import { QueryFactory } from "./query-factory";
import { ICrudService } from "./service.interface";
import { EntityManager } from "typeorm";
import { ColumnMetadata } from "typeorm/metadata/ColumnMetadata";

export interface ServiceOptions {
    model: any;
}

export function CrudBaseService(options: ServiceOptions): Type<ICrudService> {
    @Injectable()
    class CrudService implements ICrudService {
        model = options.model;
        @Inject(QueryFactory) readonly queryFactory: QueryFactory;

        getAll(params): Promise<any> {
            return this.queryFactory.selectQuery(this.model, params).getMany();
        }

        getOne(id, params): Promise<any> {
            let query = this.queryFactory.selectQuery(this.model, params);

            const primaryKey: ColumnMetadata[] =
                this.model.getRepository().metadata.primaryColumns[0]
                    .propertyName;

            query = query.andWhere(
                `${this.model.getRepository().metadata.tableName}.${primaryKey} = :id`,
                { id },
            );

            return query.getOne();
        }

        create(data, manager?: EntityManager): Promise<any> {
            return this.queryFactory.createQuery(this.model, data, manager);
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
            return this.getOne(id, {}).then((e) => e.delete(manager));
        }
    }

    return CrudService;
}
