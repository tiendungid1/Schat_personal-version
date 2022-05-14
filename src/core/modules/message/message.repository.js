import { DataRepository } from 'package/restBuilder/core/dataHandler';
import { MessageModel } from './model';

class MessageRepositoryImpl extends DataRepository {
    constructor() {
        super(MessageModel);
    }

    getById(id) {
        return this.findById(id);
    }

    getByIds(ids) {
        return this.findByIds(ids);
    }

    getMessagesByIds(ids) {
        return this.find({ room: { $in: ids } });
    }

    getMessagesById(id) {
        return this.find({ room: id });
    }

    searchByText(term, id) {
        return this.find({ $text: { $search: term }, room: id }).limit(10);
    }

    getMessagesByRegex(id, pattern) {
        return this.find({
            room: id,
            content: { $regex: pattern, $options: 'i' },
        });
    }
}

export const MessageRepository = new MessageRepositoryImpl();
