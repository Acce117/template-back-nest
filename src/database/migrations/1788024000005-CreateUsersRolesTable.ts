import {
    MigrationInterface,
    QueryRunner,
    Table,
    TableForeignKey,
    TableIndex,
} from "typeorm";

export class CreateUsersRolesTable1788024000005 implements MigrationInterface {
    name = "CreateUsersRolesTable1788024000005";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: "users_roles",
                columns: [
                    { name: "id_user", type: "int", isPrimary: true },
                    { name: "id_role", type: "int", isPrimary: true },
                ],
                foreignKeys: [
                    new TableForeignKey({
                        columnNames: ["id_user"],
                        referencedTableName: "users",
                        referencedColumnNames: ["id"],
                        onDelete: "CASCADE",
                        onUpdate: "CASCADE",
                    }),
                    new TableForeignKey({
                        columnNames: ["id_role"],
                        referencedTableName: "role",
                        referencedColumnNames: ["id_role"],
                        onDelete: "CASCADE",
                        onUpdate: "CASCADE",
                    }),
                ],
                indices: [
                    new TableIndex({ columnNames: ["id_user"] }),
                    new TableIndex({ columnNames: ["id_role"] }),
                ],
            }),
            true,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("users_roles", true);
    }
}
