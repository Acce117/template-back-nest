import { CollectionParamsOptions } from './CollectionParamsOptions';

export class StructuralParamsOptions {
    name?: string;
    select?: Array<string>;
    relations?: Array<string | CollectionParamsOptions>;
}
