/* eslint-disable operator-linebreak */
/* eslint-disable arrow-body-style */
import {
    BadRequestError,
    InternalServerError,
    ForbiddenError,
    NotFoundError,
} from '../response/exception';

export function errorDto(dto) {
    if (
        dto instanceof BadRequestError ||
        dto instanceof InternalServerError ||
        dto instanceof ForbiddenError ||
        dto instanceof NotFoundError
    ) {
        return true;
    }
}
