import { BAD_REQUEST } from 'http-status';
import { InValidHttpResponse } from 'package/handler/response';
import { ERROR_CODE } from 'package/httpException/enum';

export const responseJoiError = (res, error) => new InValidHttpResponse(
    BAD_REQUEST,
    ERROR_CODE.BAD_REQUEST,
    'Bad request',
    error.details?.map(detail => ({
        type: detail.type,
        message: detail.message,
    }))
).toResponse(res);
