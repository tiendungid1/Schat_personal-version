import { extendBaseModel } from 'core/infrastructure/model';
import { model, Types } from 'mongoose';

const schema = extendBaseModel({
    room: { type: Types.ObjectId, ref: 'rooms', required: true },
    sender: { type: String, required: true },
    content: { type: String, required: true },
    isPinned: { type: Boolean, default: false },
    reply: {
        id: { type: Types.ObjectId, ref: 'messages' },
        content: { type: String },
    },
    reaction: [
        {
            sender: { type: String },
            ava: { type: String },
            content: { type: String },
        },
    ],
});

schema.path('content').index({ text: true }, { default_language: 'none' });

export const MessageModel = model('messages', schema);
