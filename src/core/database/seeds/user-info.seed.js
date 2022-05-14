import { UserModel } from 'core/modules/user/model';
import { Types } from 'mongoose';

export class UserInfoSeed {
    static async run() {
        const id1 = new Types.ObjectId();
        const id2 = new Types.ObjectId();
        const id3 = new Types.ObjectId();

        await UserModel.insertMany([
            {
                email: 'tiendung@gmail.com',
                name: 'Tien Dung',
                rooms: [id1, id2, id3],
            },
            {
                email: 'duchuy@gmail.com',
                name: 'Duc Huy',
                rooms: [id1, id2],
            },
            {
                email: 'tuanhung@gmail.com',
                name: 'Tuan Hung',
                rooms: [id1],
            },
            {
                email: 'minhdong@gmail.com',
                name: 'Minh Dong',
                rooms: [id2, id3],
            },
            {
                email: 'hientran@gmail.com',
                name: 'Tran Thi Hien',
                rooms: [id3],
            },
        ]);
    }
}
