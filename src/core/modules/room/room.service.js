/* eslint-disable quotes */
/* eslint-disable operator-linebreak */
/* eslint-disable implicit-arrow-linebreak */
/* eslint-disable no-undef */
/* eslint-disable arrow-body-style */
import {
    DataPersistenceService,
    documentCleanerVisitor,
} from 'package/restBuilder/core/dataHandler';
import { generateRandomString } from 'core/utils';
import {
    BadRequestError,
    InternalServerError,
} from '../web-socket/response/exception';
import { errorDto } from '../web-socket/dto';
import { RoomRepository } from './room.repository';
import { toObjectId, objectIdToString } from '../mongoose/utils/objectId.utils';
import { UserService } from '../user';

class RoomServiceImpl extends DataPersistenceService {
    constructor() {
        super(RoomRepository);
    }

    async getRooms(userId) {
        let rooms;

        try {
            rooms = await this.repository.getRoomsById(toObjectId(userId));
        } catch (error) {
            return new InternalServerError(
                "Getting internal error when trying to get user's chat groups",
            );
        }

        return rooms.map(room => {
            return {
                name: room.name,
                id: room._id,
                members: room.members,
                pinMessages: room.pinMessages,
            };
        });
    }

    async getRoomInfo(infoType, input) {
        let room;

        try {
            switch (infoType) {
                case 'info-of-one-by-id':
                    room = await this.repository.getRoomById(input);
                    break;

                default:
                    break;
            }
        } catch (error) {
            return new InternalServerError(
                'Getting internal error while trying to get chat group info',
            );
        }

        if (!room || room.deletedAt !== null) {
            return new BadRequestError('This chat group does not exist');
        }

        return room;
    }

    async searchRooms(dto) {
        const user = await UserService.getUserInfo(
            'info-of-one-by-email',
            dto.senderEmail,
        );

        if (errorDto(user)) {
            return user;
        }

        let searchedRooms;

        try {
            searchedRooms = await this.repository.searchByText(
                dto.term,
                user._id,
            );
        } catch (error) {
            return new InternalServerError(
                'Getting internal error while trying to search for groups',
            );
        }

        return searchedRooms;
    }

    async createPrivateRoom(userIds) {
        const newRoom = await this.createOneSafety(
            documentCleanerVisitor({
                name: generateRandomString(),
                isPrivate: true,
            }),
        );

        if (errorDto(newRoom)) {
            return newRoom;
        }

        try {
            await this.patchOne(newRoom._id, newRoom, {
                members: userIds,
            });

            await UserService.updateRoom(userIds, newRoom._id);
        } catch (error) {
            return new InternalServerError(
                'Getting internal error while trying to create new private group',
            );
        }

        return {
            name: newRoom.name,
            id: newRoom._id,
        };
    }

    async createRoom(dto) {
        const user = await UserService.getUserInfo(
            'info-of-one-by-email',
            dto.senderEmail,
        );

        if (errorDto(user)) {
            return user;
        }

        const newRoom = await this.createOneSafety(
            documentCleanerVisitor({
                name: dto.name,
                createdBy: objectIdToString(user._id),
            }),
        );

        if (errorDto(newRoom)) {
            return newRoom;
        }

        try {
            await this.patchOne(newRoom._id, newRoom, {
                members: dto.memberIds.map(id => objectIdToString(id)),
            });

            await UserService.updateRoom(dto.memberIds, newRoom._id);
        } catch (error) {
            return new InternalServerError(
                'Getting internal error while trying to create new group',
            );
        }

        return {
            name: newRoom.name,
            id: newRoom._id,
        };
    }

    async updateRoomName(dto) {
        const id = toObjectId(dto.roomId);
        const room = await this.getRoomInfo('info-of-one-by-id', id);

        if (errorDto(room)) {
            return room;
        }

        if (room.isPrivate) {
            return new BadRequestError(
                'You can not change the private group name',
            );
        }

        const oldRoom = room.name;

        try {
            await this.patchOne(id, room, {
                name: dto.newName,
            });
        } catch (error) {
            return new InternalServerError(
                'Getting internal error while trying to update group name',
            );
        }

        return {
            roomId: objectIdToString(room._id),
            newRoom: dto.newName,
            oldRoom,
        };
    }

    async updateRoomThumbnail(room, thumbnail) {
        try {
            await this.patchOne(room._id, room, {
                thumbnail,
            });
        } catch (error) {
            return new InternalServerError(
                'Getting internal error while trying to update group thumbnail',
            );
        }
    }

    async deleteMember(roomId, userId) {
        try {
            await this.updateArrayFieldOfOne(
                'pull',
                { _id: roomId },
                {
                    members: userId,
                },
            );
        } catch (error) {
            return new InternalServerError(
                'Getting internal error while trying to delete member from group',
            );
        }
    }

    async deleteRoom(roomId) {
        const deletedRoom = await this.softDeleteById(toObjectId(roomId));

        if (errorDto(deletedRoom)) {
            return deletedRoom;
        }

        return {
            id: objectIdToString(deletedRoom._id),
            name: deletedRoom.name,
        };
    }

    addMembers(userIds, roomId) {
        const promises = [];

        userIds.forEach(id => {
            promises.push(
                this.updateArrayFieldOfOne(
                    'push',
                    { _id: roomId },
                    {
                        members: id,
                    },
                ),
            );
        });

        return Promise.all(promises);
    }

    async grantAdminPrivilege(room, memberId) {
        try {
            await this.patchOne(room._id, room, {
                createdBy: memberId,
            });
        } catch (error) {
            return new InternalServerError(
                "Getting internal error while trying to change group's admin",
            );
        }
    }
}

export const RoomService = new RoomServiceImpl();
