import { Injectable } from "@nestjs/common";
import {
    BaseEntity,
    EntityManager,
    Repository,
    SelectQueryBuilder,
} from "typeorm";
import { ColumnMetadata } from "typeorm/metadata/ColumnMetadata";
import { RelationMetadata } from "typeorm/metadata/RelationMetadata";

@Injectable()
export class QueryFactory {
    public selectQuery(model, params): SelectQueryBuilder<BaseEntity> {
        let query = model.createQueryBuilder(
            model.getRepository().metadata.tableName,
        );

        if (params.select) query = query.select(params.select);
        if (params.relations)
            query = this.setRelations(model, params.relations, query);
        if (params.where) query = this.collectionQuery(model, params, query);

        return query;
    }

    public collectionQuery(
        model,
        where,
        query?,
    ): SelectQueryBuilder<BaseEntity> {
        const table = model.getRepository().metadata.tableName;
        const primaryKey: ColumnMetadata[] =
            model.getRepository().metadata.primaryColumns[0].propertyName;

        query = query || model.createQueryBuilder(table);

        if (Array.isArray(where))
            query.where(`${table}.${primaryKey} IN (:...ids)`, {
                ids: where,
            });
        else if (typeof where === "object") {
            const { resultString, resultParams } = this.buildWhere(
                where,
                table,
            );
            query = query.where(resultString, resultParams);
        }

        return query;
    }

    private setRelations(
        model,
        relations,
        query: SelectQueryBuilder<BaseEntity>,
    ): SelectQueryBuilder<BaseEntity> {
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
                let resultString,
                    resultParams = null;

                if (relation.where) {
                    const where = this.buildWhere(
                        relation.where,
                        relation.name,
                    );
                    resultString = where.resultString;
                    resultParams = where.resultParams;
                }

                query.leftJoinAndSelect(
                    `${alias}.${relation.name}`,
                    relation.name,
                    resultString,
                    resultParams,
                );

                if (relation.relations)
                    query = this.setRelations(query, relation, relation.name);
            }
        });

        return query;
    }

    private buildWhere(params, alias, oper = "and") {
        let resultString = "";
        let resultParams = {};
        let recursiveCall = null;

        for (const key in params) {
            if (key === "or" || key === "and") {
                recursiveCall = this.buildWhere(params[key], alias, key);
                resultString += `(${recursiveCall.resultString})`;
            } else {
                //TODO handle another operator than equals
                //TODO handle NOT operator
                if (resultString !== "") resultString += ` ${oper} `;

                resultString += `${alias}.${key} = :${key}`;

                resultParams[key] = params[key];
            }
        }

        resultParams = {
            ...resultParams,
            ...recursiveCall?.resultParams,
        };

        return {
            resultString,
            resultParams,
        };
    }

    public async createQuery(model, data, manager: EntityManager) {
        const repository: Repository<any> = model.getRepository();

        const element = await this.createObjectAndRelations(
            model,
            data,
            repository,
        );

        return manager.withRepository(repository).save(element);
    }

    public async createObjectAndRelations(
        model,
        data,
        repository: Repository<any> | null = null,
    ) {
        if (!repository) repository = model.getRepository();
        const relations: RelationMetadata[] = repository.metadata.relations;

        const element = repository.create(data);

        for (const relation of relations) {
            if (relation.propertyName in data) {
                const relationType = relation.relationType;
                if (
                    relationType === "one-to-one" ||
                    relationType === "many-to-one"
                )
                    await this.createSingleRelation(element, relation, data);
                else await this.createMultipleRelation(element, relation, data);
            }
        }

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
