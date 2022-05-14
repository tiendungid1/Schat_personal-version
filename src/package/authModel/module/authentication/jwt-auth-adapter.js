import { AUTH_CONTEXT } from 'package/authModel/common/enum';
import { UserDetail } from '../user';
import { JwtValidator } from './jwt-validator';

export class JwtAuthAdapter {
    static USER_DETAIL_CLASS = UserDetail

    #token;

    #userDetail

    static builder() {
        return new JwtAuthAdapter();
    }

    collectRequestToken(req) {
        this.#token = req.headers[AUTH_CONTEXT.AUTHORIZATION_HEADER];
        return this;
    }

    #applyPreAuthorizationToUserDetail = () => {
        if (this.#userDetail) {
            this.#userDetail.getRole();
            this.#userDetail.getPermission();
        }
    }

    #attachAuthContextToRequest = req => {
        if (this.#userDetail) {
            req[AUTH_CONTEXT.KEY_AUTH_CONTEXT] = this.#userDetail;
        }
    }

    validateAndTransfer(req) {
        if (this.#token) {
            const body = JwtValidator
                .builder()
                .applyToken(this.#token)
                .validate()
                .getPayload();
            this.#userDetail = new JwtAuthAdapter.USER_DETAIL_CLASS(body);
            this.#applyPreAuthorizationToUserDetail();
            this.#attachAuthContextToRequest(req);
        }
    }
}
