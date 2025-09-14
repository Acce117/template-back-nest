import { DataSource } from "typeorm";
import { ICrudService } from "../services/service.interface";

export interface IController {
    service: ICrudService;
    dataSource?: DataSource;
}
export interface ICrudController extends IController {
    getAll(params, body);
    getOne(id, params, body);
    create(body);
    update(id, body);
}
