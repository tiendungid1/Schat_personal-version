import { UserModel } from 'core/modules/user/model';
import { RoomModel } from 'core/modules/room/model';

export class RoomSeed {
    static async run() {
        const user1 = await UserModel.findOne({ email: 'tiendung@gmail.com' });
        const user2 = await UserModel.findOne({ email: 'duchuy@gmail.com' });
        const user3 = await UserModel.findOne({ email: 'tuanhung@gmail.com' });
        const user4 = await UserModel.findOne({ email: 'minhdong@gmail.com' });
        const user5 = await UserModel.findOne({ email: 'hientran@gmail.com' });

        await RoomModel.insertMany([
            {
                _id: user1.rooms[0],
                name: 'Team BE',
                members: [user1._id, user2._id, user3._id],
                createdBy: user1._id,
            },
            {
                _id: user1.rooms[1],
                name: 'Team Find Bug',
                members: [user1._id, user2._id, user4._id],
                createdBy: user2._id,
            },
            {
                _id: user1.rooms[2],
                name: 'Team FE',
                members: [user1._id, user4._id, user5._id],
                createdBy: user4._id,
            },
        ]);
    }
}
