export interface ICrudService {
    model: any;
    getAll(params);
    getOne(params, id?);
    create(data, manager?);
    update(id, data, manager?);
    delete(id, manager?);
}

export interface ICrudTreeService extends ICrudService {
    getAncestors(params, id?);
}
