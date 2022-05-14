import { InValidHttpResponse } from '../response';

export class InvalidUrlFilter {
    filter(req, res) {
        return InValidHttpResponse.toNotFoundResponse(`Can not ${req.method} ${req.path}`).toResponse(res);
    }
}
