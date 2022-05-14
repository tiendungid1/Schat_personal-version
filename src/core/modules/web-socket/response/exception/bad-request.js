import { BAD_REQUEST } from 'http-status';
import { ERROR_CODE } from 'package/httpException/enum';

export class BadRequestError {
    constructor(msg = 'Bad request') {
        this.msg = msg;
        this.code = ERROR_CODE.BAD_REQUEST;
        this.status = BAD_REQUEST;
    }
}
