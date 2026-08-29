import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateRolesTable1788024000001 implements MigrationInterface {
    name = "CreateRolesTable1788024000001";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: "role",
                columns: [
                    {
                        name: "id_role",
                        type: "int",
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: "increment",
                    },
                    { name: "name", type: "varchar", isNullable: false },
                    { name: "description", type: "varchar", isNullable: false },
                ],
            }),
            true,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("role", true);
    }
}
