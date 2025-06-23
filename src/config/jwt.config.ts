import { ConfigService } from "@nestjs/config";
import { JwtModuleOptions } from "@nestjs/jwt";

const jwtConfig = (config: ConfigService): JwtModuleOptions => ({
    global: true,
    secret: config.get("JWT_SECRET"),
    signOptions: {
        expiresIn: "1 day",
    },
});

export default jwtConfig;
