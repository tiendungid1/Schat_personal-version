import { UNAUTHORIZED } from 'http-status';
import { ERROR_CODE } from './enum';
import { HttpException } from './http.exception';

export class UnauthorizedException extends HttpException {
    constructor(msg = 'Your access token is not valid') {
        super(msg, ERROR_CODE.UNAUTHORIZED, UNAUTHORIZED);
    }
}
