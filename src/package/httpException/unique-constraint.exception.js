import { CONFLICT } from 'http-status';
import { ERROR_CODE } from './enum';
import { HttpException } from './http.exception';

export class UniqueConstraintException extends HttpException {
    constructor(msg = 'Conflict references id') {
        super(msg, ERROR_CODE.UNIQUE_CONSTAINT, CONFLICT);
    }
}
