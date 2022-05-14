import { ApiDocument } from 'core/config/swagger.config';
import { SwaggerDocument } from 'package/swagger';

ApiDocument.addModel('Login Data', {
    email: SwaggerDocument.ApiProperty({ type: 'string' }),
    password: SwaggerDocument.ApiProperty({ type: 'string' }),
});

export const LoginUserDto = body => ({
    email: body.email,
    password: body.password,
});
