export interface ICrudService<T = any> {
    getAll(params): Promise<T[]>;
    getById(id, params?): Promise<T>;
    // exists(params);
    create(data: T | T[]): Promise<T>;
    update(id, data: Partial<T>);
    delete(id);
    deleteMany(ids);
    dataAmount(params);
}
