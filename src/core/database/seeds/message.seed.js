import { UserModel } from 'core/modules/user/model';
import { RoomModel } from 'core/modules/room/model';
import { MessageModel } from 'core/modules/message/model';

export class MessageSeed {
    static getRandomArrayElements(array) {
        return array[Math.floor(Math.random() * array.length)];
    }

    static generateData(rooms, usersInBeRoom, usersInFbRoom, usersInFeRoom) {
        const data = [];

        for (let i = 1; i <= 30; i += 1) {
            const randomRoom = this.getRandomArrayElements(rooms);

            switch (randomRoom.name) {
                case 'Team BE':
                    data.push({
                        room: randomRoom._id,
                        sender: this.getRandomArrayElements(usersInBeRoom),
                        content: Math.random().toString(36).substring(2, 25),
                    });
                    break;

                case 'Team Find Bug':
                    data.push({
                        room: randomRoom._id,
                        sender: this.getRandomArrayElements(usersInFbRoom),
                        content: Math.random().toString(36).substring(2, 25),
                    });
                    break;

                default:
                    data.push({
                        room: randomRoom._id,
                        sender: this.getRandomArrayElements(usersInFeRoom),
                        content: Math.random().toString(36).substring(2, 25),
                    });
                    break;
            }
        }

        return data;
    }

    static async run() {
        const beRoom = await RoomModel.findOne({ name: 'Team BE' });
        const fbRoom = await RoomModel.findOne({ name: 'Team Find Bug' });
        const feRoom = await RoomModel.findOne({ name: 'Team FE' });

        const usersInBeRoom = (
            await UserModel.find({ _id: { $in: beRoom.members } })
        ).map(user => user.name);

        const usersInFbRoom = (
            await UserModel.find({ _id: { $in: fbRoom.members } })
        ).map(user => user.name);

        const usersInFeRoom = (
            await UserModel.find({ _id: { $in: feRoom.members } })
        ).map(user => user.name);

        const messages = this.generateData(
            [beRoom, fbRoom, feRoom],
            usersInBeRoom,
            usersInFbRoom,
            usersInFeRoom,
        );

        await MessageModel.insertMany(messages);
    }
}
