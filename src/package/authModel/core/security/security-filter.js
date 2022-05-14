import { InValidHttpResponse } from 'package/handler/response';
import { JwtAuthAdapter } from '../../module/authentication';

export class SecurityFilter {
    filter(req, res, next) {
        try {
            JwtAuthAdapter
                .builder()
                .collectRequestToken(req)
                .validateAndTransfer(req);
        } catch (error) {
            return new InValidHttpResponse(error.status, error.code, error.message).toResponse(res);
        }
        return next();
    }
}
