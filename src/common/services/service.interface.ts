export interface ICrudService<T = any> {
    model: any;
    getAll(params): Promise<T[]>;
    getById(id, params?): Promise<T>;
    exists(whereConditions);
    create(data: T | T[], manager?): Promise<T>;
    update(id, data: Partial<T>, manager?);
    delete(id, manager?);
    dataAmount(params);
}

export interface ICrudTreeService<T = any> extends ICrudService<T> {
    getAncestors(params, id?);
}
