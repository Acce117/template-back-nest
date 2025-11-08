import { Injectable } from "@nestjs/common";
import { ManagerContainer, TransactionHandler } from "./transactionHandler";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource, EntityManager } from "typeorm";

class TypeOrmManagerContainer implements ManagerContainer<EntityManager> {
    constructor(readonly manager: EntityManager) {}
}

@Injectable()
export class TypeOrmHandler implements TransactionHandler {
    @InjectDataSource() dataSource: DataSource;

    async handle(cb: CallableFunction): Promise<any> {
        const queryRunner = this.dataSource.createQueryRunner();
        let result = null;

        try {
            await queryRunner.startTransaction();

            result = await cb(
                // new TypeOrmManagerContainer(queryRunner.manager)
                queryRunner.manager
            );

            await queryRunner.commitTransaction();
        } catch (e) {
            await queryRunner.rollbackTransaction();

            throw e;
        } finally {
            await queryRunner.release();
        }


        return result;
    }
}