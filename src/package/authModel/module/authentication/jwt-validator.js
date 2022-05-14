import { decode } from 'jsonwebtoken';
import { AUTH_CONTEXT } from 'package/authModel/common/enum';
import { UnauthorizedException } from 'package/httpException';

export class JwtValidator {
    #accessToken;

    #payload;

    static builder() {
        return new JwtValidator();
    }

    applyToken(accessToken) {
        if (accessToken) {
            this.#accessToken = accessToken.startsWith(AUTH_CONTEXT.PREFIX_HEADER)
                ? accessToken.slice(7)
                : accessToken;
        }
        return this;
    }

    validate() {
        if (this.#accessToken) {
            try {
                this.#payload = decode(this.#accessToken);
            } catch (error) {
                throw new UnauthorizedException();
            }
        }
        return this;
    }

    getPayload() {
        return this.#payload;
    }
}
