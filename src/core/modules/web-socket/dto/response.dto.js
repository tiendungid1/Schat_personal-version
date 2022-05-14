/* eslint-disable object-curly-newline */
/* eslint-disable operator-linebreak */
import { TypeUtil } from 'core/utils';
import { UserService } from 'core/modules/user';
import { objectIdToString } from '../../mongoose/utils/objectId.utils';

export class Preparation {
    static forAllConversationsDto(rooms, messages) {
        const promises = [];

        rooms.forEach(room => {
            promises.push(Preparation.forOneRoomSyncDto(room, messages));
        });

        return Promise.all(promises);
    }

    /**
     * @param {Object} room
     * @param {Array} messages
     * @returns {<{
     *  id: String,
     *  name: String,
     *  thumbnail: String,
     *  isPrivate: Boolean,
     *  members: Array<{
     *      name: String,
     *      email: String
     *  }>,
     *  messages: Array<{
     *      id: String,
     *      room: String,
     *      sender: String,
     *      content: String,
     *      isPinned: Boolean,
     *      reply: {
     *          id: String,
     *          content: String
     *      },
     *      reaction: Array<{
     *          sender: String,
     *          ava: String,
     *          content: String
     *      }>,
     *      createdAt: String
     *  }>,
     * }>}
     */

    static async forOneRoomSyncDto(room, messages) {
        const membersInfo = (
            await UserService.getUsersInfo(
                'info-of-many-by-ids',
                room.members.map(member => objectIdToString(member)),
            )
        ).map(({ name, email, ava }) => ({
            name,
            email,
            ava,
        }));

        const messagesInRoom = [];

        messages.forEach(message => {
            if (objectIdToString(room.id) === objectIdToString(message.room)) {
                messagesInRoom.push(Preparation.forMessageDto(message));
            }
        });

        return {
            id: objectIdToString(room.id),
            name: room.name,
            thumbnail: room.thumbnail,
            isPrivateRoom: room.isPrivate,
            members: membersInfo,
            messages: messagesInRoom,
        };
    }


    static forOneRoomDto = (
        members,
        { _id, name, thumbnail, isPrivate },
        messages,
    ) => ({
        id: _id,
        name,
        thumbnail,
        isPrivate,
        members,
        messages: Preparation.forMessagesDto(messages),
    });

    /**
     * @param {Object} users
     * @returns {<{
     *  email: String,
     *  name: String,
     *  ava: String,
     *  rooms: Array<String>
     * }>}
     */
    static forUserDto = ({ email, name, ava, rooms }) => ({
        email,
        name,
        ava,
        rooms,
    });

    /**
     * @param {Array<Object>} users
     * @returns {Array<{
     *  email: String,
     *  name: String,
     *  ava: String,
     *  rooms: Array<String>
     * }>}
     */
    static forUsersDto(users) {
        if (!TypeUtil.isUndefined(users)) {
            return users.map(({ email, name, ava, rooms }) => ({
                email,
                name,
                ava,
                rooms,
            }));
        }
    }

    static forRoomIdsDto(rooms) {
        if (!TypeUtil.isUndefined(rooms)) {
            return rooms.map(room => objectIdToString(room._id));
        }
    }

    /**
     * @param {Object} message
     * @returns {<{
     *  id: String,
     *  room: String,
     *  sender: String,
     *  content: String,
     *  isPinned: Boolean,
     *  reply: {
     *      id: String,
     *      content: String
     *  },
     *  reaction: Array<{
     *      sender: String,
     *      ava: String,
     *      content: String
     *  }>,
     *  createdAt: String
     * }>}
     */
    static forMessageDto = ({
        _id,
        room,
        sender,
        content,
        isPinned,
        reply,
        reaction,
        createdAt,
    }) => ({
        id: _id,
        room,
        sender,
        content,
        isPinned,
        reply,
        reaction,
        createdAt,
    });

    /**
     * @param {Array<Object>} messages
     * @returns {Array<{
     *  id: String,
     *  room: String,
     *  sender: String,
     *  content: String,
     *  isPinned: Boolean,
     *  reply: {
     *      id: String,
     *      content: String
     *  },
     *  reaction: Array<{
     *      sender: String,
     *      ava: String,
     *      content: String
     *  }>,
     *  createdAt: String
     * }>}
     */
    static forMessagesDto(messages) {
        if (!TypeUtil.isUndefined(messages)) {
            return messages.map(
                ({
                    _id,
                    room,
                    sender,
                    content,
                    isPinned,
                    reply,
                    reaction,
                    createdAt,
                }) => ({
                    id: _id,
                    room,
                    sender,
                    content,
                    isPinned,
                    reply,
                    reaction,
                    createdAt,
                }),
            );
        }
    }

    static forFilesDto(messages) {
        if (!TypeUtil.isUndefined(messages)) {
            return messages.map(({ content }) => content);
        }
    }
}
