import { DataRepository } from 'package/restBuilder/core/dataHandler';
import { UserModel } from './model';

class UserRepositoryImpl extends DataRepository {
    constructor() {
        super(UserModel);
    }

    getByEmail(email) {
        return this.findOne({ email });
    }

    getById(id) {
        return this.findById(id);
    }

    searchByText(term) {
        return this.find({ $text: { $search: term } }).limit(10);
    }

    getByIds(ids) {
        return this.findByIds(ids);
    }

    getByEmails(emails) {
        return this.find({ email: { $in: emails } });
    }

    updateManyByIds(ids, field) {
        return this.updateByIds(ids, { $push: field });
    }
}

export const UserRepository = new UserRepositoryImpl();
