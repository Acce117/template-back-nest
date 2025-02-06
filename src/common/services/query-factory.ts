import { Injectable } from "@nestjs/common";
import { BaseEntity, SelectQueryBuilder } from "typeorm";
import { RelationMetadata } from "typeorm/metadata/RelationMetadata";

@Injectable()
export class QueryFactory {
    public collectionQuery(
        model,
        params,
        query?,
    ): SelectQueryBuilder<BaseEntity> {
        query =
            query ||
            model.createQueryBuilder(model.getRepository().metadata.tableName);

        if (Array.isArray(params.where))
            query.where(`${model.alias}.${model.primaryKey} IN (:...ids)`, {
                ids: params.where,
            });
        else if (typeof params.where === "object") {
            const { resultString, resultParams } = this.buildWhere(
                params.where,
                model.alias,
            );
            query = query.where(resultString, resultParams);
        }

        return query;
    }

    public selectQuery(model, params): SelectQueryBuilder<BaseEntity> {
        let query = model.createQueryBuilder(
            model.getRepository().metadata.tableName,
        );

        if (params.select) query = query.select(params.select);
        if (params.relations) query = this.setRelations(model, params, query);
        if (params.where) query = this.collectionQuery(model, params, query);

        return query;
    }

    private setRelations(
        model,
        params,
        query: SelectQueryBuilder<BaseEntity>,
    ): SelectQueryBuilder<BaseEntity> {
        params.relations.forEach((relation) => {
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
                    `${alias}.${relation.name || relation[`[name]`]}`,
                    relation.name || relation["[name]"],
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

    public async createQuery(model, data, manager) {
        const repository = model.getRepository();
        const element = await this.innerCreateQuery(model, data, repository);
        return manager
            ? manager.withRepository(repository).save(element)
            : repository.save(element);
    }

    //TODO working on it
    /**Some relations types still in progress */
    public async innerCreateQuery(model, data, repository) {
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
                    element[relation.propertyName] =
                        await this.innerCreateQuery(
                            data[`${relation.propertyName}`],
                            relation.type,
                            null,
                        );
                else {
                    if (Array.isArray(data[relation.propertyName])) {
                        const to_create = [];
                        data[relation.propertyName].forEach((e) => {
                            if (typeof e === "object") to_create.push(e);
                        });

                        const related = await this.innerCreateQuery(
                            to_create,
                            relation.type,
                            null,
                        );

                        const elements = await this.collectionQuery(
                            {
                                where: data[relation.propertyName],
                            },
                            relation.type,
                        ).getMany();

                        element[relation.propertyName] = [
                            ...related,
                            ...elements,
                        ];
                    }
                }
            }
        }

        return element;
    }
}
