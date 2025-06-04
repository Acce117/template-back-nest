import {
    applyDecorators,
    Body,
    Controller,
    Delete,
    Get,
    Inject,
    Param,
    Patch,
    Post,
    Query,
    Type,
} from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { ICrudController } from "./controller.interface";
import { ICrudService } from "../services/service.interface";
import { ValidateDtoPipe } from "../pipes/validateDto.pipe";
import { instanceToPlain } from "class-transformer";
import { handleTransaction } from "../utils/handleTransaction";
import { QueryBuilderPipe } from "../pipes/queryBuilder.pipe";

interface EndPointOptions {
    decorators?: Array<MethodDecorator>;
}
interface BaseControllerOptions extends EndPointOptions {
    prefix: string;
    service: object;
    dto?: any;
    getAll?: EndPointOptions | false;
    getOne?: EndPointOptions | false;
    create?: EndPointOptions | false;
    update?: EndPointOptions | false;
    delete?: EndPointOptions | false;
}

function controllerDecorators(endpointOptions, httpMethodDecorator) {
    let result = [];
    if (endpointOptions !== false) {
        result = endpointOptions
            ? endpointOptions.push(httpMethodDecorator)
            : [httpMethodDecorator];
    }

    return result;
}

export function CrudBaseController(
    options: BaseControllerOptions,
): Type<ICrudController> {
    @applyDecorators(...(options.decorators ?? []))
    @Controller(options.prefix)
    class CrudController implements ICrudController {
        @Inject(options.service) service: ICrudService<any>;
        @InjectDataSource() dataSource: DataSource;

        @applyDecorators(...controllerDecorators(options.getAll, Get()))
        async getAll(
            @Query(new QueryBuilderPipe()) params,
            @Body() body,
        ): Promise<any> {
            const result = await this.service.getAll({
                ...params,
                ...body,
            });

            const count = await this.service.dataAmount(params);

            const pages = Math.ceil(count / params.limit);

            return {
                pages,
                actual_page: Math.ceil(
                    params.offset || count / params.limit || 10,
                ),
                count,
                result,
            };
        }

        @applyDecorators(...controllerDecorators(options.getOne, Get(":id")))
        async getOne(
            @Param("id") id: number,
            @Query(new QueryBuilderPipe()) params,
            @Body() body,
        ) {
            const result = await this.service.getOne(
                {
                    ...params,
                    ...body,
                },
                id,
            );
            return instanceToPlain(result);
        }

        @applyDecorators(...controllerDecorators(options.create, Post()))
        create(@Body(new ValidateDtoPipe(options.dto, "create")) body) {
            return handleTransaction(this.dataSource, async (manager) => {
                const result = await this.service.create(body, manager);
                return instanceToPlain(result);
            });
        }

        @applyDecorators(...controllerDecorators(options.update, Patch(":id")))
        async update(
            @Param("id") id: number,
            @Body(new ValidateDtoPipe(options.dto, "update")) body,
        ) {
            return handleTransaction(this.dataSource, async (manager) => {
                const result = await this.service.update(id, body, manager);
                return instanceToPlain(result);
            });
        }

        @applyDecorators(...controllerDecorators(options.delete, Delete(":id")))
        public async delete(@Param("id") id: number) {
            return handleTransaction(this.dataSource, async (manager) => {
                const result = await this.service.delete(id, manager);
                return instanceToPlain(result);
            });
        }
    }

    return CrudController;
}
