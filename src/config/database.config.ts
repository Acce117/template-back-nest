import { ConfigService } from "@nestjs/config";
import { TypeOrmModuleOptions } from "@nestjs/typeorm";
import { join } from "path";

const databaseConfig = (config: ConfigService): TypeOrmModuleOptions => {
    return {
        type: "postgres",
        host: config.get("DB_HOST"),
        port: config.get<number>("DB_PORT"),
        database: config.get("DB_NAME"),
        username: config.get("DB_USERNAME"),
        password: config.get("DB_PASSWORD"),
        logging: true,
        autoLoadEntities: true,
        synchronize: false,
        migrations: [
            join(import.meta.dirname, "..", "database", "migrations", "*.js"),
        ],
        migrationsRun: true,
    };
};

export default databaseConfig;
