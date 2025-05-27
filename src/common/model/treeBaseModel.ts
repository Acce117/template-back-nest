import { Tree, TreeChildren, TreeParent } from "typeorm";
import { BaseModel } from "./baseModel";

@Tree("materialized-path")
export class TreeBaseModel<T> extends BaseModel {
    @TreeParent()
    parent: T;

    @TreeChildren()
    children: T[];
}
