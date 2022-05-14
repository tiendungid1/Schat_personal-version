import { DataRepository } from 'package/restBuilder/core/dataHandler';
import { RoomModel } from './model';

class RoomRepositoryImpl extends DataRepository {
    constructor() {
        super(RoomModel);
    }

    getRoomsById(id) {
        return this.find({ members: id, deletedAt: { $eq: null } });
    }

    getRoomById(id) {
        return this.findById(id);
    }

    searchByText(term, id) {
        return this.find({ $text: { $search: term }, members: id }).limit(10);
    }
}

export const RoomRepository = new RoomRepositoryImpl();
