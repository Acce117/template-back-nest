import { Tree, TreeChildren, TreeParent } from "typeorm";
import { BaseModel } from "./baseModel.js";

@Tree("materialized-path")
export class TreeBaseModel extends BaseModel {
    @TreeParent()
    parent: this;

    @TreeChildren()
    children: this;
}
