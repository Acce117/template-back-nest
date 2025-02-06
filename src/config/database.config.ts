import { ConfigService } from "@nestjs/config";
import { TypeOrmModuleOptions } from "@nestjs/typeorm";

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
        synchronize: true,
    };
};

export default databaseConfig;
