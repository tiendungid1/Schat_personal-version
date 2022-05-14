import { UNAUTHORIZED } from 'http-status';
import { ERROR_CODE } from 'package/httpException/enum';

export class UnauthorizedError {
    constructor(msg = 'Your access token is not valid') {
        this.msg = msg;
        this.code = ERROR_CODE.UNAUTHORIZED;
        this.status = UNAUTHORIZED;
    }
}
