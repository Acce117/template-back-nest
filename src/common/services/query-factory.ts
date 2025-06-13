import { Injectable } from "@nestjs/common";
import { plainToInstance } from "class-transformer";
import {
    Brackets,
    Repository,
    SelectQueryBuilder,
    WhereExpressionBuilder,
} from "typeorm";
import { ColumnMetadata } from "typeorm/metadata/ColumnMetadata";
import { RelationMetadata } from "typeorm/metadata/RelationMetadata";

@Injectable()
export class QueryFactory {
    public selectQuery<T>(model, params): SelectQueryBuilder<T> {
        let query: SelectQueryBuilder<T> = model.createQueryBuilder(
            model.getRepository().metadata.tableName,
        );

        if (params.select) query = query.select(params.select);
        if (params.relations)
            query = this.setRelations(model, params.relations, query);
        if (params.where)
            query = this.collectionQuery(model, params.where, query);
        if (params.ordered_by) query = this.orderedBy(params.ordered_by, query);
        if (params.limit) query = query.limit(params.limit);
        if (params.offset) query = query.offset(params.offset);

        return query;
    }

    private orderedBy(ordered_by, query: SelectQueryBuilder<any>) {
        const fields: Array<string> = [];
        let sortMethod: "ASC" | "DESC" = "ASC";
        if (Array.isArray(ordered_by)) fields.push(...ordered_by);
        else {
            fields.push(...ordered_by.fields);
            sortMethod = ordered_by.sort_method || "ASC";
        }

        query.orderBy(`${fields}`, sortMethod);
        return query;
    }

    public collectionQuery(model, where, query?): SelectQueryBuilder<any> {
        const alias = model.getRepository().metadata.tableName;
        const primaryKey: ColumnMetadata[] =
            model.getRepository().metadata.primaryColumns[0].propertyName;

        query = query || model.createQueryBuilder(alias);

        if (Array.isArray(where))
            query.where(`${alias}.${primaryKey} IN (:...ids)`, {
                ids: where,
            });
        else if (typeof where === "object") {
            query = this.buildWhere(where, alias, query);
        }

        return query;
    }

    private setRelations(
        model,
        relations,
        query: SelectQueryBuilder<any>,
    ): SelectQueryBuilder<any> {
        relations.forEach((relation) => {
            let alias =
                typeof model === "string"
                    ? model
                    : model.getRepository().metadata.tableName;

            if (typeof relation === "string") {
                relation = relation.split(".");

                relation.forEach((rel) => {
                    query.leftJoinAndSelect(`${alias}.${rel}`, rel);
                    alias = rel;
                });
            } else if (typeof relation === "object") {
                query.leftJoinAndSelect(
                    `${alias}.${relation.name}`,
                    relation.name,
                );

                this.buildWhere(relation.where, relation.name, query);

                if (relation.relations)
                    query = this.setRelations(
                        relation.name,
                        relation.relations,
                        query,
                    );
            }
        });

        return query;
    }

    private buildWhere(
        params,
        alias,
        query: WhereExpressionBuilder,
        oper = "and",
    ) {
        let statement = null;
        let parameters = null;

        for (const key in params) {
            if (key === "or" || key === "and") {
                statement = new Brackets((qb) => {
                    return this.buildWhere(params[key], alias, qb, key);
                });
            } else {
                statement = `${alias}.${key} = :${key}`;
                parameters = {
                    [key]: params[key],
                };
            }

            if (oper === "and") query.andWhere(statement, parameters);
            else query.orWhere(statement, parameters);
        }

        return query;
    }

    public async createQuery(model, data) {
        const repository: Repository<any> = model.getRepository();

        return this.createObjectAndRelations(model, data, repository);
    }

    public async createObjectAndRelations(
        model,
        data,
        repository: Repository<any> | null = null,
    ) {
        if (!repository) repository = model.getRepository();
        const relations: RelationMetadata[] = repository.metadata.relations;

        const element = plainToInstance(model, data, {
            ignoreDecorators: true,
        });

        const promises = [];
        for (const relation of relations) {
            if (relation.propertyName in data) {
                const relationType = relation.relationType;
                if (
                    relationType === "one-to-one" ||
                    relationType === "many-to-one"
                )
                    promises.push(
                        this.createSingleRelation(element, relation, data),
                    );
                else
                    promises.push(
                        this.createMultipleRelation(element, relation, data),
                    );
            }
        }

        await Promise.all(promises);

        return element;
    }

    private async createSingleRelation(element, relation, data) {
        element[relation.propertyName] = await this.createObjectAndRelations(
            relation.type,
            data[`${relation.propertyName}`],
        );
    }

    private async createMultipleRelation(element, relation, data) {
        const to_create = [];
        const to_select = [];
        const related = [];
        const promises = [];

        data[relation.propertyName].map((e) => {
            if (typeof e === "object") to_create.push(e);
            else to_select.push(e);
        });

        if (to_create.length > 0)
            promises.push(
                this.createObjectAndRelations(relation.type, to_create),
            );

        if (to_select.length > 0)
            promises.push(
                this.collectionQuery(relation.type, to_select).getMany(),
            );

        (await Promise.all(promises)).forEach((elements) =>
            related.push(...elements),
        );

        if (related.length > 0) element[relation.propertyName] = related;
    }
}
