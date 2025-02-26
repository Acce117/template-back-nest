import { CrudBaseService } from "src/common/services/service";
import { BlackListedToken } from "../models/blacklist.entity";

export class BlackListService extends CrudBaseService({
    model: BlackListedToken,
}) {}
