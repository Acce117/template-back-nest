import { DataSource } from "typeorm";

export async function handleTransaction(
    dataSource: DataSource,
    cb: CallableFunction,
    errorCb?: CallableFunction,
) {
    const queryRunner = dataSource.createQueryRunner();
    let result = null;
    try {
        await queryRunner.startTransaction();
        result = await cb(queryRunner.manager);

        await queryRunner.commitTransaction();
    } catch (e) {
        await queryRunner.rollbackTransaction();

        if (errorCb) errorCb();

        result = e;
    } finally {
        await queryRunner.release();
    }

    return result;
}
