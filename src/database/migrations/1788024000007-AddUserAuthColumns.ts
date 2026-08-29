import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddUserAuthColumns1788024000007 implements MigrationInterface {
    name = "AddUserAuthColumns1788024000007";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            "users",
            new TableColumn({
                name: "is_verified",
                type: "boolean",
                isNullable: false,
                default: false,
            }),
        );
        await queryRunner.addColumn(
            "users",
            new TableColumn({
                name: "verification_code",
                type: "varchar",
                isNullable: true,
            }),
        );
        await queryRunner.addColumn(
            "users",
            new TableColumn({
                name: "verification_code_expires_at",
                type: "timestamp",
                isNullable: true,
            }),
        );
        await queryRunner.addColumn(
            "users",
            new TableColumn({
                name: "created_at",
                type: "timestamp",
                isNullable: false,
                default: "CURRENT_TIMESTAMP",
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn("users", "created_at");
        await queryRunner.dropColumn("users", "verification_code_expires_at");
        await queryRunner.dropColumn("users", "verification_code");
        await queryRunner.dropColumn("users", "is_verified");
    }
}
