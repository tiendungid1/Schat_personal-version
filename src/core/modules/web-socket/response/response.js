/* eslint-disable indent */
import { TypeUtil } from 'core/utils';

export function validResponse(dto = undefined) {
    return !TypeUtil.isUndefined(dto)
        ? {
              success: true,
              data: dto,
          }
        : { success: true };
}

export function invalidResponse(error) {
    return {
        success: false,
        ...error,
    };
}
