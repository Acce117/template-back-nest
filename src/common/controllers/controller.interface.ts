import { DataSource } from "typeorm";

export interface IController {
    service: object;
    dataSource?: DataSource;
}
export interface ICrudController extends IController {
    getAll(params, body);
    getOne(id, params, body);
    create(body);
    update(id, body);
}
