import { extendBaseModel } from 'core/infrastructure/model';
import { model, Types } from 'mongoose';

const schema = extendBaseModel({
    email: {
        type: String,
        trim: true,
        unique: true,
        lowercase: true,
        required: [true, 'User email is empty'],
    },
    name: {
        type: String,
        required: [true, 'User name is empty'],
    },
    ava: { type: String, default: null },
    password: {
        type: String,
        minlength: 6,
        default: '$2b$10$Ir0/wv1jzLRwRbag/r1j5.E0OtQLQJRdwCelu8GuVhpUYLOALoEkG',
    },
    rooms: [{ type: Types.ObjectId, ref: 'rooms' }],
});

schema.path('email').index({ text: true }, { default_language: 'none' });
schema.path('name').index({ text: true }, { default_language: 'none' });

export const UserModel = model('users', schema);
