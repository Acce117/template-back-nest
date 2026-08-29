import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateUsersTable1788024000003 implements MigrationInterface {
    name = "CreateUsersTable1788024000003";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: "users",
                columns: [
                    {
                        name: "id",
                        type: "int",
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: "increment",
                    },
                    { name: "username", type: "varchar", isNullable: false },
                    {
                        name: "email",
                        type: "varchar",
                        isNullable: false,
                        isUnique: true,
                    },
                    { name: "password", type: "varchar", isNullable: false },
                    { name: "profile_img", type: "varchar", isNullable: true },
                    { name: "deleted_at", type: "timestamp", isNullable: true },
                ],
            }),
            true,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("users", true);
    }
}
