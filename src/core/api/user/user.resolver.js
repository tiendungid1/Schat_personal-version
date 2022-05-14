import {
    loginUserInterceptor,
    resetUserPasswordInterceptor,
} from 'core/modules/user/interceptor';
import { Module } from 'package/handler';
import { UserController } from './user.controller';

export const UserResolver = Module.builder()
    .addPrefix({
        prefixPath: '/users',
        tag: 'users',
        module: 'UserModule',
    })
    .register([
        {
            route: '/login',
            method: 'post',
            body: 'LoginUserDto',
            interceptors: [loginUserInterceptor],
            guards: [],
            uploadHandler: null,
            controller: UserController.loginUser,
            preAuthorization: false,
        },
        {
            route: '/reset-password',
            method: 'patch',
            body: 'ResetUserPasswordDto',
            interceptors: [resetUserPasswordInterceptor],
            guards: [],
            uploadHandler: null,
            controller: UserController.resetUserPassword,
            preAuthorization: false,
        },
    ]);
