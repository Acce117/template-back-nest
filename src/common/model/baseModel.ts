import { BaseEntity, EntityManager, Repository } from "typeorm";

function softDeleteExecutor(manager: EntityManager) {
    return this.prepareDelete(manager).softDelete().execute();
}

export function softDelete(constructor: typeof BaseModel) {
    constructor.prototype.delete = softDeleteExecutor;
}

export class BaseModel extends BaseEntity {
    private prepareDelete(manager: EntityManager) {
        const repository: Repository<any> =
            Object.getPrototypeOf(this).constructor.getRepository();

        const primaryKey: string =
            repository.metadata.primaryColumns[0].propertyName;

        let query = null;
        if (manager)
            query = manager.withRepository(repository).createQueryBuilder();
        else query = repository.createQueryBuilder();

        return query.where(`${primaryKey} = :id`, {
            id: this[`${primaryKey}`],
        });
    }

    public delete(manager?: EntityManager): Promise<any> {
        return this.prepareDelete(manager).delete().execute();
    }
}
