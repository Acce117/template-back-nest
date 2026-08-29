import { join } from "path";
import { DataSource } from "typeorm";
import { User } from "../users/models/user.model.js";
import { Role } from "../users/models/role.model.js";
import { Permission } from "../users/models/permission.model.js";

export default new DataSource({
    type: "postgres",
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT),
    database: process.env.DB_NAME,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    entities: [User, Role, Permission],
    migrations: [join(import.meta.dirname, "migrations", "*.js")],
    synchronize: false,
});
