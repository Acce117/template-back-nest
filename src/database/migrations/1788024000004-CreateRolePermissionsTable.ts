import {
    MigrationInterface,
    QueryRunner,
    Table,
    TableForeignKey,
    TableIndex,
} from "typeorm";

export class CreateRolePermissionsTable1788024000004 implements MigrationInterface {
    name = "CreateRolePermissionsTable1788024000004";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: "role_permissions",
                columns: [
                    { name: "id_role", type: "int", isPrimary: true },
                    { name: "id_permission", type: "int", isPrimary: true },
                ],
                foreignKeys: [
                    new TableForeignKey({
                        columnNames: ["id_role"],
                        referencedTableName: "role",
                        referencedColumnNames: ["id_role"],
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
                    new TableIndex({ columnNames: ["id_role"] }),
                    new TableIndex({ columnNames: ["id_permission"] }),
                ],
            }),
            true,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("role_permissions", true);
    }
}
