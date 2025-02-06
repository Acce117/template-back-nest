import { ArgumentMetadata, PipeTransform } from "@nestjs/common";
import { StructuralParamsOptions } from "./params_options/StructuralParamsOptions";
import { CollectionParamsOptions } from "./params_options/CollectionParamsOptions";

export class QueryBuilderPipe implements PipeTransform {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    transform(value: any, metadata: ArgumentMetadata) {
        const transformedValue: CollectionParamsOptions = {};
        if (value.relations)
            transformedValue.relations = this.transformRelations(
                value.relations,
            );
        if (value.where) transformedValue.where = value.where;

        if (value.depth)
            return { ...transformedValue, depth: parseInt(value.depth) };
        return transformedValue;
    }

    private transformRelations(
        relations: Array<any>,
    ): Array<string | StructuralParamsOptions> {
        const transformedRelations = relations.map((relation) => {
            return typeof relation === "string"
                ? relation
                : this.transformRelation(relation);
        });

        return transformedRelations;
    }

    private transformRelation(relation: any): StructuralParamsOptions {
        const transformedRelation: StructuralParamsOptions = {};
        const regex = /\[relations\]\[[0-9]\]*/;

        relation["[name]"]
            ? (transformedRelation.name = relation["[name]"])
            : (transformedRelation.name = relation.name);

        if (relation.relations)
            transformedRelation.relations = this.transformRelations(
                relation.relations,
            );
        else {
            transformedRelation.relations = [];
            Object.keys(relation).forEach((field) => {
                if (regex.test(field))
                    transformedRelation.relations.push(relation[field]);
            });
        }

        return transformedRelation;
    }
}
