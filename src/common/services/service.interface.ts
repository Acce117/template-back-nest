export interface ICrudService<T> {
    model: any;
    getAll(params): Promise<T[]>;
    getOne(id, params): Promise<T>;
    create(data, manager?): Promise<T>;
    update(id, data, manager?);
    delete(id, manager?);
    dataAmount(params);
}

export interface ICrudTreeService<T> extends ICrudService<T> {
    getAncestors(params, id?);
}
