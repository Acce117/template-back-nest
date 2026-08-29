import { StructuralParamsOptions } from "./StructuralParamsOptions.js";

export class CollectionParamsOptions extends StructuralParamsOptions {
    where?: object;
    limit?: number;
    offset?: number;
}
