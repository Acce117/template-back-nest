import { InjectRepository } from "@nestjs/typeorm";

import { FindTreeOptions, TreeRepository } from "typeorm";
import { Injectable, Type } from "@nestjs/common";
import { CrudBaseService, ServiceOptions } from "./service";
import { ICrudTreeService } from "./service.interface";

export function TreeBaseService(
    options: ServiceOptions,
): Type<ICrudTreeService> {
    @Injectable()
    class TreeService extends CrudBaseService<any>(options) {
        constructor(
            @InjectRepository(options.model)
            readonly treeRepository: TreeRepository<any>,
        ) {
            super();
            this.treeRepository.metadata.columns =
                this.treeRepository.metadata.columns.map((x) => {
                    if (x.databaseName === "mpath") x.isVirtual = false;

                    return x;
                });
        }

        async getAll(params: FindTreeOptions) {
            return this.treeRepository.findTrees(params);
        }

        async getById(id: any, params: any) {
            const element = await super.getById(id, params);

            const result = await this.treeRepository
                .findDescendantsTree(element, params);

            return result;
        }

        async getAncestors(id: any, params: FindTreeOptions) {
            const element = await super.getById(id, params);
            
            return await this.treeRepository.findAncestors(
                element,
                params
            );
        }

        async create(data: any) {
            const parent = await this.getById(data.parent_id, {});

            const element = this.model.create(data);
            element.parent = parent;
            element.save();

            return element;
        }

        async update(id: number, data: any) {
            if (data.parent_id) {
                const element = await super.getById(id, {});
                const old_parent = element.parent;

                const new_parent = data.parent_id ? await super.getById(data.parent_id, {}) : null;

                element.parent = new_parent;
                element.mpath = this.resolvePath(
                    element.mpath,
                    new_parent?.mpath,
                    old_parent,
                );
                element.save();
            }

            const result = super.update(id, data);

            return result;
        }

        private resolvePath(
            child_path: string,
            parent_path: string,
            old_parent_id: any,
        ) {
            let new_path = parent_path || "";
            if (old_parent_id) {
                const paths_array = child_path.split(`${old_parent_id}.`);

                switch (paths_array.length) {
                    case 1:
                        new_path += paths_array[0];
                        break;
                    case 2:
                        new_path += paths_array[1];
                        break;
                }
            } else {
                new_path += child_path;
            }
            return new_path;
        }
    }

    return TreeService;
}
