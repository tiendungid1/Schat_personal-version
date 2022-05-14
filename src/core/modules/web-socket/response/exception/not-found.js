import { NOT_FOUND } from 'http-status';
import { ERROR_CODE } from 'package/httpException/enum';

export class NotFoundError {
    constructor(msg = 'Not found') {
        this.msg = msg;
        this.code = ERROR_CODE.NOT_FOUND;
        this.status = NOT_FOUND;
    }
}
