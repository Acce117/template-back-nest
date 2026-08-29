import {
    EntityManager,
    EntityTarget,
    FindOperator,
    FindOptionsRelations,
    FindOptionsWhere,
    Repository,
    SaveOptions,
} from "typeorm";
import { CriteriaDto } from "../criteria/criteria.js";
import { UnitOfWorkBuilder } from "../services/uow-builder.service.js";
import { Inject } from "@nestjs/common";

export class BaseRepository<T> extends Repository<T> {
    @Inject(UnitOfWorkBuilder) uow: UnitOfWorkBuilder;

    constructor(target: EntityTarget<T>, manager: EntityManager) {
        super(target, manager);
    }

    protected parseCriteria(filters: object) {
        const filtersKeys = Object.keys(filters);

        const where: FindOptionsWhere<T> = {};

        filtersKeys.map((key) => {
            const filterType = typeof filters[key];
            if (filterType === "object") {
                const operator = filters[key].operator;
                const multipleParameters =
                    operator === "between" || operator === "in";
                where[key] = new FindOperator(
                    operator,
                    filters[key].value,
                    true,
                    multipleParameters,
                );
            } else {
                where[key] = new FindOperator("equal", filters[key]);
            }
        });

        return where;
    }

    private buildRelations(
        relations: string[] | undefined,
    ): FindOptionsRelations<T> {
        const result: Record<string, boolean> = {};

        (relations ?? []).forEach((relation) => {
            result[relation] = true;
        });

        return result as FindOptionsRelations<T>;
    }

    async findByCriteria(criteria: CriteriaDto) {
        const where = this.parseCriteria(criteria.where);

        return this.find({
            where,
            skip: criteria.offset,
            take: criteria.limit,
            relations: this.buildRelations(criteria.relations),
        });
    }

    async countByCriteria(criteria: CriteriaDto) {
        const where = this.parseCriteria(criteria.where);

        return this.count({ where });
    }

    save<Entity extends T>(entity: Entity, options?: SaveOptions): Promise<T>;
    save<Entity extends T>(
        entity: Entity[],
        options?: SaveOptions,
    ): Promise<T[]>;
    save<Entity extends T>(
        entity: Entity | Entity[],
        options?: SaveOptions,
    ): Promise<T | T[]> {
        if (Array.isArray(entity)) {
            return this.uow.getManager().save(entity, options);
        }

        return this.uow.getManager().save(entity, options);
    }
}
