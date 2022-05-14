import { FORBIDDEN } from 'http-status';
import { ERROR_CODE } from 'package/httpException/enum';

export class ForbiddenError {
    constructor(msg = 'You do not have permission to access this resource') {
        this.msg = msg;
        this.code = ERROR_CODE.FORBIDDEN;
        this.status = FORBIDDEN;
    }
}
