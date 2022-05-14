import { extendBaseModel } from 'core/infrastructure/model';
import { model, Types } from 'mongoose';

const schema = extendBaseModel({
   name: { type: String, required: true, unique: true },
  thumbnail: { type: String, default: null },
  isPrivate: { type: Boolean, default: false },
  members: [{ type: Types.ObjectId, ref: 'users' }],
  createdBy: { type: Types.ObjectId, ref: 'users' },
});

schema.path('name').index({ text: true }, { default_language: 'none' });

export const RoomModel = model('rooms', schema);
