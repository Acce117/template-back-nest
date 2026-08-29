import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreatePermissionsTable1788024000002 implements MigrationInterface {
    name = "CreatePermissionsTable1788024000002";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: "permission",
                columns: [
                    {
                        name: "id_permission",
                        type: "int",
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: "increment",
                    },
                    { name: "code", type: "varchar", isNullable: false },
                    { name: "module", type: "varchar", isNullable: false },
                    { name: "controller", type: "varchar", isNullable: false },
                    { name: "action", type: "varchar", isNullable: false },
                    { name: "deleted_at", type: "timestamp", isNullable: true },
                ],
            }),
            true,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("permission", true);
    }
}
