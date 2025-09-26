import { InjectRepository } from "@nestjs/typeorm";

import { FindTreeOptions, TreeRepository } from "typeorm";
import { Injectable, Type } from "@nestjs/common";
import { CrudBaseService, ServiceOptions } from "./service";
import { ICrudTreeService } from "./service.interface";
import { TreeBaseModel } from "../model/treeBaseModel";

export function TreeBaseService<T extends TreeBaseModel>(
    options: ServiceOptions,
): Type<ICrudTreeService<T>> {
    @Injectable()
    class TreeService extends CrudBaseService<T>(options) {
        constructor(
            @InjectRepository(options.model)
            readonly treeRepository: TreeRepository<T>,
        ) {
            super();
            this.treeRepository.metadata.columns =
                this.treeRepository.metadata.columns.map((x) => {
                    if (x.databaseName === "mpath") {
                        x.isVirtual = false;
                    }

                    return x;
                });
        }

        private parseParams(params) {
            const options: FindTreeOptions = {};
            params.depth !== undefined
                ? (options.depth = params.depth)
                : params.depth;
            params.relations
                ? (options.relations = params.relations)
                : params.relations;

            return options;
        }

        async getAll(params): Promise<T[]> {
            return this.treeRepository.findTrees(this.parseParams(params));
        }

        async getOne(params: any, id?: any): Promise<T> {
            const options = this.parseParams(params);
            const element = await super.getById(
                {
                    relations: options.relations,
                },
                id,
            );
            const result: T = await this.treeRepository.findDescendantsTree(
                element,
                options,
            );

            return result;
        }

        async getAncestors(params: object, id?: any): Promise<T[]> {
            const element = await super.getById(params, id);
            return await this.treeRepository.findAncestors(
                element,
                this.parseParams(params),
            );
        }

        async create(data: any): Promise<T> {
            const father: T = await this.getOne({}, data.father_group);

            const group: T = this.model.create(data);
            group.parent = father;
            group.save();

            return group;
        }

        //TODO generalized, this is too specific
        async update(id: number, data: any): Promise<T> {
            if (data.father_group !== undefined) {
                const group: any = await super.getById({}, id);
                const old_father = group.father_group;

                const new_father: any = data.father_group
                    ? await super.getById({}, data.father_group)
                    : null;
                group.parent = new_father;
                group.mpath = this.resolvePath(
                    group.mpath,
                    new_father?.mpath,
                    old_father,
                );
                group.save();
            }

            const result = super.update(id, data);

            return result;
        }

        private resolvePath(
            child_path: string,
            father_path: string,
            old_father_id: any,
        ) {
            let new_path = father_path || "";
            if (old_father_id) {
                const paths_array = child_path.split(`${old_father_id}.`);

                switch (paths_array.length) {
                    case 1:
                        new_path += paths_array[0];
                        break;
                    case 2:
                        new_path += paths_array[1];
                }
            } else {
                new_path += child_path;
            }
            return new_path;
        }
    }

    return TreeService;
}
