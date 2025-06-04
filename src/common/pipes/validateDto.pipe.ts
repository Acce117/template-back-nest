import {
    ArgumentMetadata,
    BadRequestException,
    PipeTransform,
} from "@nestjs/common";
import { plainToInstance } from "class-transformer";
import { validateSync } from "class-validator";
export class ValidateDtoPipe implements PipeTransform {
    constructor(
        private readonly dtoType: any = null,
        private readonly scenario: string,
    ) {}

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    transform(value: any, metadata: ArgumentMetadata) {
        let data = value;
        if (this.dtoType) {
            let validationResult = null;
            if (value instanceof Array) {
                const result = this.validateArray(value);
                data = result.data;
                validationResult = result.validationResult;
            } else {
                data = plainToInstance(this.dtoType, value);
                validationResult = validateSync(data, {
                    whitelist: true,
                    forbidNonWhitelisted: true,
                    groups: [this.scenario],
                });
            }

            if (validationResult.length > 0)
                throw new BadRequestException(validationResult);
        }

        return data;
    }

    //TODO improve
    validateArray(value) {
        const validationResult = [];
        const data = [];
        let validation = null;
        let entity = null;

        for (let i = 0; i < value.length; i++) {
            entity = plainToInstance(this.dtoType, value[i]);
            validation = validateSync(entity);
            data.push(entity);

            if (validation.length > 0)
                validationResult.push({ index: i, validation });
        }

        return { data, validationResult };
    }
}
