import { sign } from 'jsonwebtoken';
import { ConfigService } from 'package/config';
import { LoggerFactory } from 'package/logger';

class JwtServiceImpl {
    expiresIn;

    secret;

    constructor() {
        this.expiresIn = ConfigService.getSingleton().get('EXPIRES_IN');
        this.secret = ConfigService.getSingleton().get('JWT_SECRET');
        LoggerFactory.globalLogger.info(`[${JwtServiceImpl.name}] is bundling`);
    }

    sign(payload) {
        return sign(payload, this.secret, {
            expiresIn: this.expiresIn,
        });
    }
}

export const JwtService = new JwtServiceImpl();
