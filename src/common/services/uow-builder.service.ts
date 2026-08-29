import { Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource, EntityManager } from "typeorm";
import {
    als,
    getValue,
    setValue,
} from "../../integrations/als/als-instance.js";

const UOW_MANAGER_KEY = "uowManager";

@Injectable()
export class UnitOfWorkBuilder {
    constructor(
        @InjectDataSource()
        private readonly dataSource: DataSource,
    ) {}

    getManager(): EntityManager {
        return (
            getValue<EntityManager>(UOW_MANAGER_KEY) ?? this.dataSource.manager
        );
    }

    async doTransactional<T>(
        fn: (manager: EntityManager) => Promise<T>,
    ): Promise<T> {
        if (!als.getStore()) {
            return als.run(new Map(), () => this.doTransactional(fn));
        }

        const previousManager = getValue<EntityManager>(UOW_MANAGER_KEY);
        const queryRunner = this.dataSource.createQueryRunner();

        setValue(UOW_MANAGER_KEY, queryRunner.manager);

        try {
            await queryRunner.startTransaction();
            const result = await fn(queryRunner.manager);
            await queryRunner.commitTransaction();
            return result;
        } catch (err) {
            await queryRunner.rollbackTransaction();
            throw err;
        } finally {
            setValue(UOW_MANAGER_KEY, previousManager);
            await queryRunner.release();
        }
    }
}
