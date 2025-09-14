export interface ICrudService<T = any> {
    model: any;
    getAll(params): Promise<T[]>;
    getOne(id, params?): Promise<T>;
    create(data: T | T[], manager?): Promise<T>;
    update(id, data: Partial<T>, manager?);
    delete(id, manager?);
    dataAmount(params);
}

export interface ICrudTreeService<T> extends ICrudService<T> {
    getAncestors(params, id?);
}
