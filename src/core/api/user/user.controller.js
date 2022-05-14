import { LoginUserDto, ResetUserPasswordDto } from 'core/modules/user/dto';
import { UserService } from 'core/modules/user';
import { ValidHttpResponse } from 'package/handler/response';

class Controller {
    constructor() {
        this.service = UserService;
    }

    loginUser = async req => {
        const data = await this.service.getOne(LoginUserDto(req.body));
        return ValidHttpResponse.toOkResponse(data);
    };

    resetUserPassword = async req => {
        await this.service.resetPassword(ResetUserPasswordDto(req.body));
        return ValidHttpResponse.toNoContentResponse();
    };
}

export const UserController = new Controller();
