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
import { ICrudController } from "./controller.interface";
import { ICrudService } from "../services/service.interface";
import { ValidateDtoPipe } from "../pipes/validateDto.pipe";
import { TransactionHandlerType } from "../utils/transactionHandler";

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
        @Inject("transaction-handler")
        transactionHandler: TransactionHandlerType;

        @applyDecorators(...controllerDecorators(options.getAll, Get()))
        async getAll(@Query() params, @Body() body): Promise<any> {
            const dataOptions = { ...params, ...body };
            const result = await this.service.getAll(dataOptions);

            const count = await this.service.dataAmount(dataOptions);

            const pages = Math.ceil(count / params.limit);

            return {
                pages,
                actual_page: Math.ceil(params.offset || count / params.limit),
                count,
                result,
            };
        }

        @applyDecorators(...controllerDecorators(options.getOne, Get(":id")))
        async getOne(@Param("id") id: number, @Query() params, @Body() body) {
            return this.service.getOne(id, {
                ...params,
                ...body,
            });
        }

        @applyDecorators(...controllerDecorators(options.create, Post()))
        create(@Body(new ValidateDtoPipe(options.dto, "create")) body) {
            return this.transactionHandler.handle((manager) =>
                this.service.create(body, manager),
            );
        }

        @applyDecorators(...controllerDecorators(options.update, Patch(":id")))
        async update(
            @Param("id") id: number,
            @Body(new ValidateDtoPipe(options.dto, "update")) body,
        ) {
            return this.transactionHandler.handle((manager) =>
                this.service.update(id, body, manager),
            );
        }

        @applyDecorators(...controllerDecorators(options.delete, Delete(":id")))
        public async delete(@Param("id") id: number) {
            return this.transactionHandler.handle((manager) =>
                this.service.delete(id, manager),
            );
        }
    }

    return CrudController;
}
