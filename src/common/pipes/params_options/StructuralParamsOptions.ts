import { CollectionParamsOptions } from "./CollectionParamsOptions.js";

export class StructuralParamsOptions {
    name?: string;
    select?: Array<string>;
    relations?: Array<string | CollectionParamsOptions>;
}
