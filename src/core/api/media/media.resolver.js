import { Module } from 'package/handler';
import { MediaController } from './media.controller';

export const MediaResolver = Module.builder()
    .addPrefix({
        prefixPath: '/media',
        tag: 'media',
        module: 'MediaModule',
    })
    .register([
        {
            route: '/upload-img',
            method: 'post',
            body: 'UploadImageDto',
            interceptors: [],
            guards: [],
            controller: MediaController.uploadImage,
            preAuthorization: true,
        },
    ]);
