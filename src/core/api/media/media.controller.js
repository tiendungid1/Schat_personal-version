import { MediaService } from 'core/modules/media';
import { ValidHttpResponse } from 'package/handler/response';

class Controller {
    constructor() {
        this.service = MediaService;
    }

    uploadImage = async req => {
        const data = await this.service.uploadOne(req.files);
        return ValidHttpResponse.toOkResponse(data);
    };
}

export const MediaController = new Controller();
