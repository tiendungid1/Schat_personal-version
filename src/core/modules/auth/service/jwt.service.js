import { sign } from 'jsonwebtoken';
// import { ConfigService } from 'package/config';
import { LoggerFactory } from 'package/logger';

class JwtServiceImpl {
    expiresIn;

    secret;

    constructor() {
        this.expiresIn = '1d';
        this.secret = 'abdafabd';
        LoggerFactory.globalLogger.info(`[${JwtServiceImpl.name}] is bundling`);
    }

    sign(payload) {
        return sign(payload, this.secret, {
            expiresIn: this.expiresIn,
        });
    }
}

export const JwtService = new JwtServiceImpl();
