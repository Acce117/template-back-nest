import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

const jwtConfig = (config: ConfigService): JwtModule => ({
    global: true,
    secret: config.get('JWT_SECRET'),
    signOptions: {
        expiresIn: '1 day',
    },
});

export default jwtConfig;
