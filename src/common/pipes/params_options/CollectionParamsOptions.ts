import { StructuralParamsOptions } from "./StructuralParamsOptions";

export class CollectionParamsOptions extends StructuralParamsOptions {
    where?: object;
    limit?: number;
    offset?: number;
}
