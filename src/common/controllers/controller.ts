import {
    applyDecorators,
    Body,
    Controller,
    Delete,
    Get,
    Inject,
    Param,
    ParseArrayPipe,
    Patch,
    Post,
    Query,
} from "@nestjs/common";
import { plainToInstance } from "class-transformer";
import { CriteriaDto } from "../criteria/criteria.js";
import { ValidateDtoPipe } from "../pipes/validateDto.pipe.js";
import { ICrudService } from "../services/service.interface.js";
import { UnitOfWorkBuilder } from "../services/uow-builder.service.js";

interface EndPointOptions {
    decorators?: Array<MethodDecorator>;
}
interface BaseControllerOptions extends EndPointOptions {
    prefix: string;
    dto?: any;
    entity?: any;
    getAll?: EndPointOptions | false;
    getOne?: EndPointOptions | false;
    create?: EndPointOptions | false;
    update?: EndPointOptions | false;
    delete?: EndPointOptions | false;
    deleteMany?: EndPointOptions | false;
}

function controllerDecorators(endpointOptions, httpMethodDecorator) {
    const result = [];

    if (endpointOptions !== false)
        result.push(
            ...(endpointOptions?.decorators ?? []),
            httpMethodDecorator,
        );

    return result;
}

export function CrudBaseController(options: BaseControllerOptions) {
    @applyDecorators(...(options.decorators ?? []))
    @Controller(options.prefix)
    class CrudController {
        service: ICrudService;
        @Inject(UnitOfWorkBuilder)
        uow: UnitOfWorkBuilder;

        @applyDecorators(...controllerDecorators(options.getAll, Get()))
        async getAll(@Query() params: CriteriaDto): Promise<any> {
            const result = await this.service.getAll(params);

            const count = await this.service.dataAmount(params);

            const pages = Math.ceil(count / params.limit);

            return {
                pages,
                actualPage: Math.ceil(count / params.limit),
                count,
                data: options.entity
                    ? plainToInstance(options.entity, result, {
                          enableCircularCheck: true,
                      })
                    : result,
            };
        }

        @applyDecorators(...controllerDecorators(options.getOne, Get(":id")))
        async getById(@Param("id") id: number, @Query() params) {
            try {
                return this.service.getById(id, params).then((result) => {
                    return options.entity
                        ? plainToInstance(options.entity, result)
                        : result;
                });
            } catch (err) {
                return err;
            }
        }

        @applyDecorators(...controllerDecorators(options.create, Post()))
        create(@Body(new ValidateDtoPipe(options.dto, "create")) body) {
            return this.uow.doTransactional(() => {
                return this.service.create(body).then((result) => {
                    return options.entity
                        ? plainToInstance(options.entity, result)
                        : result;
                });
            });
        }

        @applyDecorators(...controllerDecorators(options.update, Patch(":id")))
        async update(
            @Param("id") id: number,
            @Body(new ValidateDtoPipe(options.dto, "update")) body,
        ) {
            return this.uow.doTransactional(() =>
                this.service.update(id, body).then((result) => {
                    return options.entity
                        ? plainToInstance(options.entity, result)
                        : result;
                }),
            );
        }

        @applyDecorators(...controllerDecorators(options.delete, Delete(":id")))
        public async delete(@Param("id") id: number) {
            return this.uow.doTransactional(() => this.service.delete(id));
        }

        @applyDecorators(...controllerDecorators(options.deleteMany, Delete()))
        public async deleteMany(
            @Body("ids", new ParseArrayPipe({ expectedType: Number }))
            ids: number[],
        ) {
            return this.uow.doTransactional(() => this.service.deleteMany(ids));
        }
    }

    return CrudController;
}
