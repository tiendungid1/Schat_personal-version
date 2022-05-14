import { INTERNAL_SERVER_ERROR } from 'http-status';
import { ERROR_CODE } from 'package/httpException/enum';

export class InternalServerError {
    constructor(msg = 'Internal server error') {
        this.msg = msg;
        this.code = ERROR_CODE.INTERNAL;
        this.status = INTERNAL_SERVER_ERROR;
    }
}
