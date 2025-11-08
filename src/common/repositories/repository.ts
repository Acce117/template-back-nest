import { EntityManager } from "typeorm";

export interface BaseRepository<T> {
    getAll(params): Promise<T[]>;

    getById(id, params): Promise<T>;

    create(data, manager: EntityManager);

    update(id, data, manager: EntityManager);

    dataAmount(params);
}