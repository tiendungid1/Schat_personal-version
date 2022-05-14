import mongoose from 'mongoose';
import { ConfigService } from 'package/config';
import { MongooseProvider } from '../modules/mongoose/mongoose.provider';

export const DatabaseInstance = MongooseProvider.builder()
    .setConnectionString(ConfigService.getSingleton().get('DATABASE_URL'))
    .setMongooseInstance(mongoose);
