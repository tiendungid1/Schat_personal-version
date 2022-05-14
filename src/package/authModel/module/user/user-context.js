import { AUTH_CONTEXT } from 'package/authModel/common/enum';

export function getUserContext(req) {
    return req[AUTH_CONTEXT.KEY_AUTH_CONTEXT];
}
