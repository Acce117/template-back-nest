import { Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";

export type TransactionHandlerType = { handle(cb, errorCb?): any };

@Injectable()
export class TransactionHandler implements TransactionHandlerType {
    @InjectDataSource() dataSource: DataSource;

    public async handle(cb: CallableFunction, errorCb?: CallableFunction) {
        const queryRunner = this.dataSource.createQueryRunner();
        let result = null;

        try {
            await queryRunner.startTransaction();

            result = await cb(queryRunner.manager);

            await queryRunner.commitTransaction();
        } catch (e) {
            await queryRunner.rollbackTransaction();

            if (errorCb) errorCb();

            result = e;
        }

        await queryRunner.release();

        return result;
    }
}
