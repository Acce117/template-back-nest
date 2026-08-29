import {
    MigrationInterface,
    QueryRunner,
    Table,
    TableForeignKey,
    TableIndex,
} from "typeorm";

export class CreateUsersPermissionsTable1788024000006 implements MigrationInterface {
    name = "CreateUsersPermissionsTable1788024000006";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: "users_permissions",
                columns: [
                    { name: "id_user", type: "int", isPrimary: true },
                    { name: "id_permission", type: "int", isPrimary: true },
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
                        columnNames: ["id_permission"],
                        referencedTableName: "permission",
                        referencedColumnNames: ["id_permission"],
                        onDelete: "CASCADE",
                        onUpdate: "CASCADE",
                    }),
                ],
                indices: [
                    new TableIndex({ columnNames: ["id_user"] }),
                    new TableIndex({ columnNames: ["id_permission"] }),
                ],
            }),
            true,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("users_permissions", true);
    }
}
