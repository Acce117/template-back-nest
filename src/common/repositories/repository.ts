import { ManagerContainer } from "../handlers/transactionHandler.js";

export interface BaseRepository<T> {
    getAll(params): Promise<T[]>;

    getById(id, params): Promise<T>;

    create(data, manager: ManagerContainer);

    update(id, data, manager: ManagerContainer);

    dataAmount(params);
}
