import { Optional } from 'core/utils';
import { DataPersistenceService } from 'package/restBuilder/core/dataHandler';
import { BadRequestException } from 'package/httpException';
import {
    BadRequestError,
    InternalServerError,
} from '../web-socket/response/exception';
import { UserRepository } from './user.repository';
import { BcryptService, JwtService } from '../auth/service';
import { profileResponse } from './mapper/user.response';
import { TypeUtil } from '../../utils';

class UserServiceImpl extends DataPersistenceService {
    constructor() {
        super(UserRepository);
        this.bcryptService = BcryptService;
        this.jwtService = JwtService;
    }

    /**
     * @param {import('core/modules/user').loginUserDto} loginUserDto
     */
    async getOne(loginUserDto) {
        const user = await this.repository.getByEmail(loginUserDto.email);

        Optional.of(user).throwIfNotPresent(
            new BadRequestException('This account does not exist'),
        );

        this.bcryptService.verifyComparison(
            loginUserDto.password,
            user.password,
        );

        return profileResponse(user, this.jwtService.sign({ id: user._id }));
    }

    /**
     * @param {import('core/modules/user').resetUserPasswordDto} resetUserPasswordDto
     */
    async resetPassword(resetUserPasswordDto) {
        const user = await this.repository.getByEmail(
            resetUserPasswordDto.email,
        );

        Optional.of(user).throwIfNotPresent(
            new BadRequestException('This account does not exist'),
        );

        return this.patchOne(user._id, user, {
            password: this.bcryptService.hash(resetUserPasswordDto.newPassword),
        });
    }

    /**
     * @param {String} infoType
     * @param {*} input
     * @returns
     */
    async getUserInfo(infoType, input) {
        let user;

        try {
            switch (infoType) {
                case 'info-of-one-by-id':
                    user = await this.repository.getById(input);
                    break;

                case 'info-of-one-by-email':
                    user = await this.repository.getByEmail(input);
                    break;
            }
        } catch (error) {
            return new InternalServerError(
                'Getting internal error while getting user information',
            );
        }

        if (!user || user.deletedAt !== null) {
            return new BadRequestError('This account does not exist');
        }

        return user;
    }

    async getUsersInfo(infoType, input) {
        let users;

        try {
            switch (infoType) {
                case 'info-of-many-by-ids':
                    users = await this.repository.getByIds(input);
                    break;

                case 'info-of-many-by-emails':
                    users = await this.repository.getByEmails(input);
                    break;
            }
        } catch (error) {
            return new InternalServerError(
                'Getting internal error while getting user information',
            );
        }

        if (!TypeUtil.isEqual(users.length, input.length)) {
            return new BadRequestError('Some accounts do not exist');
        }

        return users;
    }

    async searchUsers(searchTerm) {
        let searchedUsers;

        try {
            searchedUsers = await this.repository.searchByText(searchTerm);
        } catch (error) {
            return new InternalServerError(
                'Getting internal error while trying to search for users',
            );
        }

        return searchedUsers;
    }

    async updateRoom(userIds, roomId) {
        return this.repository.updateManyByIds(userIds, { rooms: roomId });
    }

    async leaveRoom(userId, roomId) {
        try {
            await this.updateArrayFieldOfOne(
                'pull',
                { _id: userId },
                {
                    rooms: roomId,
                },
            );
        } catch (error) {
            return new InternalServerError(
                // eslint-disable-next-line quotes
                "Getting internal error while trying to update user's group chat",
            );
        }
    }

    joinRoom(userIds, roomId) {
        const promises = [];

        userIds.forEach(id => {
            promises.push(
                this.updateArrayFieldOfOne(
                    'push',
                    { _id: id },
                    {
                        rooms: roomId,
                    },
                ),
            );
        });

        return Promise.all(promises);
    }
}

export const UserService = new UserServiceImpl();
