import { cloudinary } from 'core/config/cloudinary.config';
import { unlinkSync } from 'fs';
import {
    BadRequestException,
    InternalServerException,
} from 'package/httpException';
import { ConfigService } from 'package/config';

class MediaServiceImpl {
    uploadToCloudinary = ({ name, tempFilePath }, folder) =>
        // eslint-disable-next-line implicit-arrow-linebreak
        new Promise((resolve, reject) => {
            cloudinary.uploader.upload(
                tempFilePath,
                {
                    resource_type: 'auto',
                    folder,
                    public_id: name,
                    overwrite: true,
                    invalidate: true,
                },
                // eslint-disable-next-line camelcase
                (err, { secure_url }) => {
                    if (err) return reject(err);
                    return resolve({ url: secure_url });
                },
            );
        });

    transferFileAndUpload = async file =>
        // eslint-disable-next-line implicit-arrow-linebreak
        this.uploadToCloudinary(
            file,
            ConfigService.getSingleton().get('CLOUDINARY_FOLDER_NAME'),
        );

    uploadOne = async file => {
        if (!file) {
            return new BadRequestException('No file to upload');
        }

        const { name, tempFilePath } = file.image;

        let result;

        try {
            result = await this.transferFileAndUpload({ name, tempFilePath });
            unlinkSync(tempFilePath);
        } catch (error) {
            return new InternalServerException(
                'Getting internal error while uploading image',
            );
        }

        return result;
    };
}

export const MediaService = new MediaServiceImpl();
