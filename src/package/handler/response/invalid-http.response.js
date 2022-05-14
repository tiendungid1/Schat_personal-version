import { BAD_REQUEST, INTERNAL_SERVER_ERROR, NOT_FOUND } from 'http-status';
import { ERROR_CODE } from 'package/httpException/enum';
import { HttpResponse } from './http.response';

export class InValidHttpResponse extends HttpResponse {
    constructor(status, code, message, detail) {
        super(status, {
            message,
            code,
            status,
            detail
        });
    }

    static toInternalResponse(msg) {
        return new InValidHttpResponse(INTERNAL_SERVER_ERROR, ERROR_CODE.INTERNAL, msg);
    }

    static toNotFoundResponse(msg) {
        return new InValidHttpResponse(NOT_FOUND, ERROR_CODE.NOT_FOUND, msg);
    }

    static toBadRequestResponse(msg) {
        return new InValidHttpResponse(BAD_REQUEST, ERROR_CODE.BAD_REQUEST, msg);
    }
}
