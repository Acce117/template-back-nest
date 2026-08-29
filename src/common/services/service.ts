import {
  applyDecorators,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { ICrudService } from "./service.interface.js";
import { FindOptionsWhere } from "typeorm";
import { BaseRepository } from "../repositories/base.repository.js";
import { CaslAbilityFactory } from "../../integrations/casl/casl-ability.factory.js";
import { Action } from "../../integrations/casl/action.js";
import { BaseModel } from "../model/baseModel.js";
import { UnitOfWorkBuilder } from "./uow-builder.service.js";

interface CrudOperationOption {
  decorators?: Array<MethodDecorator>;
}
interface BaseServiceOptions extends CrudOperationOption {
  getAll?: CrudOperationOption;
  getOne?: CrudOperationOption;
  create?: CrudOperationOption;
  update?: CrudOperationOption;
  delete?: CrudOperationOption;
  deleteMany?: CrudOperationOption;
  dataAmount?: CrudOperationOption;
}

export function CrudBaseService<T>(options?: BaseServiceOptions) {
  @Injectable()
  class CrudService implements ICrudService<T> {
    readonly repository: BaseRepository<T>;
    @Inject(CaslAbilityFactory) caslAbilityFactory: CaslAbilityFactory;
    @Inject(UnitOfWorkBuilder) uow: UnitOfWorkBuilder;

    @applyDecorators(...(options?.getAll?.decorators || []))
    async getAll(params) {
      return this.repository.findByCriteria(params);
    }

    @applyDecorators(...(options?.getOne?.decorators || []))
    async getById(id, _params?) {
      const ability = this.caslAbilityFactory.createForUser();

      const element = await this.repository.findOneBy({
        id,
      } as FindOptionsWhere<any>);

      if (!ability.can(Action.Read, element))
        throw new NotFoundException();

      return element;
    }
    @applyDecorators(...(options?.create?.decorators || []))
    async create(data: T) {
      const element = this.repository.create(data);
      return this.repository.save(element);
    }

    @applyDecorators(...(options?.update?.decorators || []))
    async update(id: number, data: any) {
      const element = await this.getById(id);

      const ability = this.caslAbilityFactory.createForUser();

      if (!ability.can(Action.Update, element))
        throw new NotFoundException();

      Object.assign(element, data);

      return this.repository.save(element);
    }

    @applyDecorators(...(options?.delete?.decorators || []))
    async delete(id: number) {
      const ability = this.caslAbilityFactory.createForUser();

      const element = await this.repository.findOneBy({
        id,
      } as FindOptionsWhere<any>);

      if (!ability.can(Action.Delete, element))
        throw new NotFoundException();

      if (element instanceof BaseModel)
        return element.delete(this.uow.getManager());

      return this.repository.remove(element);
    }

    //TODO protect
    @applyDecorators(...(options?.deleteMany?.decorators || []))
    async deleteMany(ids: number[]) {
      return this.repository.delete(ids);
    }

    @applyDecorators(...(options?.dataAmount?.decorators || []))
    dataAmount(params) {
      return this.repository.countByCriteria(params);
    }
  }

  return CrudService;
}
