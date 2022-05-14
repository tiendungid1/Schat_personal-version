import { ConfigService } from 'package/config';
import { v2 } from 'cloudinary';

v2.config({
    cloud_name: ConfigService.getSingleton().get('CLOUDINARY_NAME'),
    api_key: ConfigService.getSingleton().get('CLOUDINARY_API_KEY'),
    api_secret: ConfigService.getSingleton().get('CLOUDINARY_API_SECRET'),
    secure: true,
});

export const cloudinary = v2;
