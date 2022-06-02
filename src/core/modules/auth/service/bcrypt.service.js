// @ts-check
import { compareSync, hashSync, genSaltSync } from 'bcrypt';
// import { ConfigService } from 'package/config';
import { UnauthorizedException } from 'package/httpException';
import { LoggerFactory } from 'package/logger';

class BcryptServiceImpl {
    static DEFAULT_MSG_INCOMPATIBLE_PWD = 'Your current password is incorrect';

    saltRounds;

    constructor() {
        this.saltRounds = Number.parseInt('10', 10);
        LoggerFactory.globalLogger.info(
            `[${BcryptServiceImpl.name}] is bundling`,
        );
    }

    /**
     * @param {string} str normal string
     * @param {string} hashed hashed string
     */
    compare(str, hashed) {
        return compareSync(str, hashed);
    }

    /**
     * @param {string} str to be hashed
     */
    hash(str) {
        const salt = genSaltSync(this.saltRounds);
        return hashSync(str, salt);
    }

    verifyComparison(
        str,
        hashed,
        msg = BcryptServiceImpl.DEFAULT_MSG_INCOMPATIBLE_PWD,
    ) {
        if (!this.compare(str, hashed)) {
            throw new UnauthorizedException(msg);
        }
    }
}

export const BcryptService = new BcryptServiceImpl();
