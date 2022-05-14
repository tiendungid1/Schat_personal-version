import { ApiDocument } from 'core/config/swagger.config';
import { SwaggerDocument } from 'package/swagger';

ApiDocument.addModel('Reset User Password Data', {
    email: SwaggerDocument.ApiProperty({ type: 'string' }),
    newPassword: SwaggerDocument.ApiProperty({ type: 'string' }),
});

export const ResetUserPasswordDto = body => ({
    email: body.email,
    newPassword: body.newPassword,
});
