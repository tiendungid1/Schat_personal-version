/* eslint-disable arrow-body-style */
/* eslint-disable function-paren-newline */
/* eslint-disable object-curly-newline */
/* eslint-disable operator-linebreak */
/* eslint-disable implicit-arrow-linebreak */
import { JwtValidator } from 'package/authModel/module/authentication';
import { LoggerFactory } from 'package/logger';
import {
    UnauthorizedError,
    BadRequestError,
    ForbiddenError,
    InternalServerError,
} from './response/exception';
import { validResponse, invalidResponse } from './response';
import { UserService } from '../user';
import { RoomService } from '../room';
import { MessageService } from '../message';
import { ArrayObjectUtil, TypeUtil } from '../../utils';
import { objectIdToString, toObjectId } from '../mongoose/utils/objectId.utils';
import { errorInRequestDto } from './interceptor';
import { Preparation, errorDto, Properties, PATTERN } from './dto';
import { sortRoomsByMessagesDateCreated } from './utils';

class WebSocketServiceImpl {
    socketRooms = new Map();

    onlineUsers = new Map();

    /**
     * ---------- HANDLE: FIRST TIME RUNNING ----------
     */

    jwtAuthenticationMiddleware(io, socket, accessToken, ...fns) {
        const payload = JwtValidator.builder()
            .applyToken(accessToken)
            .validate()
            .getPayload();

        if (TypeUtil.isNull(payload)) {
            socket.emit(
                'event:authenticateUser',
                invalidResponse(new UnauthorizedError()),
            );
            return;
        }

        fns.forEach(fn => {
            fn.call(this, io, socket, payload);
        });
    }

    async getAllConversations(io, socket, payload) {
        const roomsResponse = await RoomService.getRooms(payload.id);

        if (errorDto(roomsResponse)) {
            socket.emit(
                'event:getAllConversations',
                invalidResponse(roomsResponse),
            );
            return;
        }

        if (TypeUtil.isEmptyArray(roomsResponse)) {
            socket.emit(
                'event:getAllConversations',
                validResponse({
                    msg: 'This user is not in any conversations',
                }),
            );
            return;
        }

        const messagesResponse = await MessageService.getMessagesOfRooms(
            roomsResponse.map(room => room.id),
        );

        if (errorDto(messagesResponse)) {
            socket.emit(
                'event:getAllConversations',
                invalidResponse(messagesResponse),
            );
            return;
        }

        const data = sortRoomsByMessagesDateCreated(
            await Preparation.forAllConversationsDto(
                roomsResponse,
                messagesResponse,
            ),
        );

        this.changeStatus(io, socket, payload);
        this.createSocketRoom(data);
        this.joinSocketRoom(socket, payload);

        socket.emit('event:getAllConversations', validResponse(data));
    }

    async changeStatus(io, socket, payload) {
        let username = null;

        const user = await UserService.getUserInfo(
            'info-of-one-by-id',
            payload.id,
        );

        if (!TypeUtil.existsKeyInMap(this.onlineUsers, user.email)) {
            this.onlineUsers.set(user.email, socket.id);
            username = user.email;
            LoggerFactory.globalLogger.info(`User ${username} is online`);
        }

        socket.on('disconnect', () => {
            LoggerFactory.globalLogger.info(`User ${username} is offline`);
            this.onlineUsers.delete(username);
            username = null;
        });
    }

    createSocketRoom(data) {
        data.forEach(el => {
            if (!TypeUtil.existsKeyInMap(this.socketRooms, el.id)) {
                this.socketRooms.set(el.id, el.name);
            }
        });
    }

    async joinSocketRoom(socket, payload) {
        const { rooms } = await UserService.getUserInfo(
            'info-of-one-by-id',
            payload.id,
        );

        rooms.forEach(room => {
            if (
                TypeUtil.existsKeyInMap(
                    this.socketRooms,
                    objectIdToString(room),
                )
            ) {
                socket.join(this.socketRooms.get(objectIdToString(room)));
            }
        });
    }

    /**
     * ---------- HANDLE: SEND MESSAGE IN GROUP ----------
     */

    groupMessaging(io, socket) {
        socket.on('event:groupMessaging', async dto => {
            if (
                errorInRequestDto(
                    socket,
                    'event:groupMessaging',
                    dto,
                    Properties.ofNewMessageDto,
                )
            ) {
                return;
            }

            const userResponse = await UserService.getUserInfo(
                'info-of-one-by-email',
                dto.senderEmail,
            );

            if (errorDto(userResponse)) {
                socket.emit(
                    'event:groupMessaging',
                    invalidResponse(userResponse),
                );
                return;
            }

            const { rooms } = userResponse;
            const isUserInRoom = rooms.some(
                room => objectIdToString(room) === dto.roomId,
            );

            if (!socket.rooms.has(dto.room) || !isUserInRoom) {
                socket.emit(
                    'event:groupMessaging',
                    invalidResponse(
                        new ForbiddenError(
                            'You do not have permission to send message to this chat group',
                        ),
                    ),
                );
                return;
            }

            const createdMessageResponse = await MessageService.createOne({
                ...dto,
                sender: userResponse.name,
            });

            if (errorDto(createdMessageResponse)) {
                socket.emit(
                    'event:groupMessaging',
                    invalidResponse(createdMessageResponse),
                );
                return;
            }

            io.to(dto.room).emit(
                'event:groupMessaging',
                validResponse(
                    Preparation.forMessageDto(createdMessageResponse),
                ),
            );
        });
    }

    privateMessaging(io, socket) {
        socket.on('event:privateMessaging', async dto => {
            if (
                !TypeUtil.isEmptyArray(
                    TypeUtil.existsPropertiesInObj(dto, 'roomId', 'room'),
                )
            ) {
                await this.startNewPrivateConversations(io, socket, dto);
                return;
            }

            if (
                errorInRequestDto(
                    socket,
                    'event:privateMessaging',
                    dto,
                    Properties.ofNewMessageDto,
                )
            ) {
                return;
            }

            const userResponse = await UserService.getUserInfo(
                'info-of-one-by-email',
                dto.senderEmail,
            );

            if (errorDto(userResponse)) {
                socket.emit(
                    'event:privateMessaging',
                    invalidResponse(userResponse),
                );
                return;
            }

            const { rooms } = userResponse;
            const isUserInRoom = rooms.some(
                room => objectIdToString(room) === dto.roomId,
            );

            if (!socket.rooms.has(dto.room) || !isUserInRoom) {
                socket.emit(
                    'event:privateMessaging',
                    invalidResponse(
                        new ForbiddenError(
                            'You do not have permission to send message to this private chat group',
                        ),
                    ),
                );
                return;
            }

            const createdMessageResponse = await MessageService.createOne({
                ...dto,
                sender: userResponse.name,
            });

            if (errorDto(createdMessageResponse)) {
                socket.emit(
                    'event:privateMessaging',
                    invalidResponse(createdMessageResponse),
                );
                return;
            }

            io.to(dto.room).emit(
                'event:privateMessaging',
                validResponse(
                    Preparation.forMessageDto(createdMessageResponse),
                ),
            );
        });
    }

    setPinMessage(io, socket) {
        socket.on('event:setPinMessage', async dto => {
            if (
                errorInRequestDto(
                    socket,
                    'event:setPinMessage',
                    dto,
                    Properties.ofSetPinMessageDto,
                )
            ) {
                return;
            }

            const userResponse = await UserService.getUserInfo(
                'info-of-one-by-email',
                dto.senderEmail,
            );

            if (errorDto(userResponse)) {
                socket.emit(
                    'event:setPinMessage',
                    invalidResponse(userResponse),
                );
                return;
            }

            const roomResponse = await RoomService.getRoomInfo(
                'info-of-one-by-id',
                dto.roomId,
            );

            if (errorDto(roomResponse)) {
                socket.emit(
                    'event:setPinMessage',
                    invalidResponse(roomResponse),
                );
                return;
            }

            if (
                !TypeUtil.existsElementInArray(
                    roomResponse.members.map(member =>
                        objectIdToString(member),
                    ),
                    objectIdToString(userResponse._id),
                ) ||
                !TypeUtil.isEqual(dto.room, roomResponse.name)
            ) {
                socket.emit(
                    'event:setPinMessage',
                    invalidResponse(
                        new ForbiddenError(
                            'You do not have permission to set pin message for this group',
                        ),
                    ),
                );
                return;
            }

            const messageResponse = await MessageService.getOne(dto.messageId);

            if (errorDto(messageResponse)) {
                socket.emit(
                    'event:setPinMessage',
                    invalidResponse(messageResponse),
                );
                return;
            }

            if (
                !TypeUtil.isEqual(
                    objectIdToString(messageResponse.room),
                    objectIdToString(roomResponse._id),
                )
            ) {
                socket.emit(
                    'event:setPinMessage',
                    invalidResponse(
                        new BadRequestError(
                            'The message you want to pin is not in this group',
                        ),
                    ),
                );
                return;
            }

            const setPinMessageResponse = await MessageService.setPinMessage(
                messageResponse,
            );

            if (errorDto(setPinMessageResponse)) {
                socket.emit(
                    'event:setPinMessage',
                    invalidResponse(setPinMessageResponse),
                );
                return;
            }

            io.to(dto.room).emit(
                'event:setPinMessage',
                validResponse(
                    Preparation.forMessageDto({
                        ...messageResponse,
                        isPinned: true,
                    }),
                ),
            );
        });
    }

    replyToMessage(io, socket) {
        socket.on('event:replyToMessage', async dto => {
            if (
                errorInRequestDto(
                    socket,
                    'event:replyToMessage',
                    dto,
                    Properties.ofReplyToMessageDto,
                )
            ) {
                return;
            }

            const userResponse = await UserService.getUserInfo(
                'info-of-one-by-email',
                dto.senderEmail,
            );

            if (errorDto(userResponse)) {
                socket.emit(
                    'event:replyToMessage',
                    invalidResponse(userResponse),
                );
                return;
            }

            const roomResponse = await RoomService.getRoomInfo(
                'info-of-one-by-id',
                dto.roomId,
            );

            if (errorDto(roomResponse)) {
                socket.emit(
                    'event:replyToMessage',
                    invalidResponse(roomResponse),
                );
                return;
            }

            if (
                !TypeUtil.existsElementInArray(
                    roomResponse.members.map(member =>
                        objectIdToString(member),
                    ),
                    objectIdToString(userResponse._id),
                ) ||
                !TypeUtil.isEqual(dto.room, roomResponse.name)
            ) {
                socket.emit(
                    'event:replyToMessage',
                    invalidResponse(
                        new ForbiddenError(
                            'You do not have permission to send message in this group',
                        ),
                    ),
                );
                return;
            }

            const beingRepliedMessageResponse = await MessageService.getOne(
                dto.messageId,
            );

            if (errorDto(beingRepliedMessageResponse)) {
                socket.emit(
                    'event:replyToMessage',
                    invalidResponse(beingRepliedMessageResponse),
                );
                return;
            }

            if (
                !TypeUtil.isEqual(
                    objectIdToString(beingRepliedMessageResponse.room),
                    objectIdToString(roomResponse._id),
                )
            ) {
                socket.emit(
                    'event:replyToMessage',
                    invalidResponse(
                        new BadRequestError(
                            'The message you want to reply to is not in this group',
                        ),
                    ),
                );
                return;
            }

            const createdMessageResponse =
                await MessageService.createOneWithReply(
                    { ...dto, sender: userResponse.name },
                    beingRepliedMessageResponse,
                );

            if (errorDto(createdMessageResponse)) {
                socket.emit(
                    'event:replyToMessage',
                    invalidResponse(createdMessageResponse),
                );
                return;
            }

            io.to(dto.room).emit(
                'event:replyToMessage',
                validResponse(
                    Preparation.forMessageDto(createdMessageResponse),
                ),
            );
        });
    }

    reactToMessage(io, socket) {
        socket.on('event:reactToMessage', async dto => {
            if (
                errorInRequestDto(
                    socket,
                    'event:reactToMessage',
                    dto,
                    Properties.ofReactToMessageDto,
                )
            ) {
                return;
            }

            const userResponse = await UserService.getUserInfo(
                'info-of-one-by-email',
                dto.senderEmail,
            );

            if (errorDto(userResponse)) {
                socket.emit(
                    'event:reactToMessage',
                    invalidResponse(userResponse),
                );
                return;
            }

            const roomResponse = await RoomService.getRoomInfo(
                'info-of-one-by-id',
                dto.roomId,
            );

            if (errorDto(roomResponse)) {
                socket.emit(
                    'event:reactToMessage',
                    invalidResponse(roomResponse),
                );
                return;
            }

            if (
                !TypeUtil.existsElementInArray(
                    roomResponse.members.map(member =>
                        objectIdToString(member),
                    ),
                    objectIdToString(userResponse._id),
                ) ||
                !TypeUtil.isEqual(dto.room, roomResponse.name)
            ) {
                socket.emit(
                    'event:reactToMessage',
                    invalidResponse(
                        new ForbiddenError(
                            'You do not have permission to react to message in this group',
                        ),
                    ),
                );
                return;
            }

            const beingReactedMessageResponse = await MessageService.getOne(
                dto.messageId,
            );

            if (errorDto(beingReactedMessageResponse)) {
                socket.emit(
                    'event:reactToMessage',
                    invalidResponse(beingReactedMessageResponse),
                );
                return;
            }

            if (
                !TypeUtil.isEqual(
                    objectIdToString(beingReactedMessageResponse.room),
                    objectIdToString(roomResponse._id),
                )
            ) {
                socket.emit(
                    'event:reactToMessage',
                    invalidResponse(
                        new BadRequestError(
                            'The message you want to react to is not in this group',
                        ),
                    ),
                );
                return;
            }

            const updatedMessageResponse =
                await MessageService.setReactionForMessage(
                    beingReactedMessageResponse,
                    {
                        ...dto,
                        ...userResponse,
                    },
                );

            if (errorDto(updatedMessageResponse)) {
                socket.emit(
                    'event:reactToMessage',
                    invalidResponse(updatedMessageResponse),
                );
                return;
            }

            io.to(dto.room).emit(
                'event:reactToMessage',
                validResponse(
                    Preparation.forMessageDto({
                        ...beingReactedMessageResponse,
                        reaction: {
                            sender: userResponse.name,
                            ava: userResponse.ava,
                            content: dto.content,
                        },
                    }),
                ),
            );
        });
    }

    broadcastTyping(io, socket) {
        socket.on('event:typing', dto => {
            socket.to(dto.room).emit(
                'event:typing',
                validResponse({
                    msg: `${dto.user} is typing...`,
                }),
            );
        });
    }

    /**
     * ---------- HANDLE: CREATE NEW GROUP CHAT ----------
     */

    async startNewPrivateConversations(io, socket, dto) {
        if (
            errorInRequestDto(
                socket,
                'event:privateMessaging',
                dto,
                Properties.ofNewPrivateChatDto,
            )
        ) {
            return;
        }

        const senderResponse = await UserService.getUserInfo(
            'info-of-one-by-email',
            dto.senderEmail,
        );

        if (errorDto(senderResponse)) {
            socket.emit(
                'event:privateMessaging',
                invalidResponse(senderResponse),
            );
            return;
        }

        const receiverResponse = await UserService.getUserInfo(
            'info-of-one-by-email',
            dto.receiverEmail,
        );

        if (errorDto(receiverResponse)) {
            socket.emit(
                'event:privateMessaging',
                invalidResponse(receiverResponse),
            );
            return;
        }

        const newRoomResponse = await RoomService.createPrivateRoom(
            [senderResponse, receiverResponse].map(user =>
                objectIdToString(user._id),
            ),
        );

        if (errorDto(newRoomResponse)) {
            socket.emit(
                'event:privateMessaging',
                invalidResponse(newRoomResponse),
            );
            return;
        }

        const createdMessageResponse = await MessageService.createOne({
            roomId: objectIdToString(newRoomResponse.id),
            sender: senderResponse.name,
            content: dto.content,
        });

        if (errorDto(createdMessageResponse)) {
            socket.emit(
                'event:privateMessaging',
                invalidResponse(createdMessageResponse),
            );
            return;
        }

        const data = {
            name: newRoomResponse.name,
            id: objectIdToString(newRoomResponse.id),
            thumbnail: null,
            isPrivate: true,
            members: [
                {
                    name: senderResponse.name,
                    email: senderResponse.email,
                    ava: senderResponse.ava,
                },
                {
                    name: receiverResponse.name,
                    email: receiverResponse.email,
                    ava: receiverResponse.ava,
                },
            ],
            messages: [Preparation.forMessageDto(createdMessageResponse)],
        };

        this.createSocketRoom([data]);
        socket.join(newRoomResponse.name);

        data.members.forEach(member => {
            if (TypeUtil.existsKeyInMap(this.onlineUsers, member.email)) {
                io.to(this.onlineUsers.get(member.email)).emit(
                    'event:privateMessaging',
                    validResponse(data),
                );
            }
        });
    }

    createNewGroup(io, socket) {
        socket.on('event:createNewGroup', async dto => {
            if (
                errorInRequestDto(
                    socket,
                    'event:createNewGroup',
                    dto,
                    Properties.ofNewGroupChatDto,
                )
            ) {
                return;
            }

            const isCreatorInMembers = dto.memberEmails.some(
                email => email === dto.senderEmail,
            );

            if (!isCreatorInMembers) {
                socket.emit(
                    'event:createNewGroup',
                    invalidResponse(
                        new BadRequestError(
                            // eslint-disable-next-line quotes
                            "Creator's email does not exist in list email of members",
                        ),
                    ),
                );
                return;
            }

            const usersResponse = await UserService.getUsersInfo(
                'info-of-many-by-emails',
                dto.memberEmails,
            );

            if (errorDto(usersResponse)) {
                socket.emit(
                    'event:createNewGroup',
                    invalidResponse(usersResponse),
                );
                return;
            }

            const newRoomResponse = await RoomService.createRoom({
                ...dto,
                memberIds: usersResponse.map(user => user._id),
            });

            if (errorDto(newRoomResponse)) {
                socket.emit(
                    'event:createNewGroup',
                    invalidResponse(newRoomResponse),
                );
                return;
            }

            const data = {
                name: newRoomResponse.name,
                id: objectIdToString(newRoomResponse.id),
                thumbnail: null,
                isPrivate: false,
                members: usersResponse.map(({ email, name, ava }) => ({
                    email,
                    name,
                    ava,
                })),
            };

            this.createSocketRoom([data]);

            data.members.forEach(member => {
                if (TypeUtil.existsKeyInMap(this.onlineUsers, member.email)) {
                    io.to(this.onlineUsers.get(member.email)).emit(
                        'event:createNewGroup',
                        validResponse(data),
                    );
                }
            });
        });
    }

    joinNewSocketRoom(io, socket) {
        socket.on('event:joinNewSocketRoom', dto => {
            if (
                errorInRequestDto(
                    socket,
                    'event:joinNewSocketRoom',
                    dto,
                    Properties.ofJoinNewSocketRoomDto,
                )
            ) {
                return;
            }

            if (!TypeUtil.existsKeyInMap(this.socketRooms, dto.roomId)) {
                socket.emit(
                    'event:joinNewSocketRoom',
                    invalidResponse(
                        new BadRequestError(
                            'You can not join non-existent room',
                        ),
                    ),
                );
                return;
            }

            socket.join(dto.room);

            socket.emit('event:joinNewSocketRoom', validResponse());
        });
    }

    /**
     * ---------- HANDLE: SEARCH USERS, GROUPS, MESSAGES ----------
     */

    searchUsersAndGroups(io, socket) {
        socket.on(
            'event:searchUsersAndGroups',
            async (infoWantToSearch, dto) => {
                if (!infoWantToSearch) {
                    socket.emit(
                        'event:searchUsersAndGroups',
                        invalidResponse(
                            new BadRequestError('Missing info type'),
                        ),
                    );
                    return;
                }

                if (
                    infoWantToSearch !== 'user' &&
                    infoWantToSearch !== 'room' &&
                    infoWantToSearch !== 'both'
                ) {
                    socket.emit(
                        'event:searchUsersAndGroups',
                        invalidResponse(
                            new BadRequestError(
                                // eslint-disable-next-line quotes
                                "Info type must be 'user' or 'room' or 'both'",
                            ),
                        ),
                    );
                    return;
                }

                if (
                    errorInRequestDto(
                        socket,
                        'event:searchUsersAndGroups',
                        dto,
                        Properties.ofSearchUsersAndGroupsDto,
                    )
                ) {
                    return;
                }

                let searchedUsersResponse;
                let searchedRoomsResponse;

                switch (infoWantToSearch) {
                    case 'user':
                        searchedUsersResponse = await UserService.searchUsers(
                            dto.term,
                        );
                        break;

                    case 'room':
                        searchedRoomsResponse = await RoomService.searchRooms(
                            dto,
                        );
                        break;

                    case 'both':
                        searchedUsersResponse = await UserService.searchUsers(
                            dto.term,
                        );
                        searchedRoomsResponse = await RoomService.searchRooms(
                            dto,
                        );
                        break;
                }

                if (
                    errorDto(searchedUsersResponse) ||
                    errorDto(searchedRoomsResponse)
                ) {
                    socket.emit(
                        'event:searchUsersAndGroups',
                        invalidResponse({
                            userError: searchedUsersResponse,
                            roomError: searchedRoomsResponse,
                        }),
                    );
                    return;
                }

                const data = {
                    users: Preparation.forUsersDto(searchedUsersResponse),
                    rooms: Preparation.forRoomIdsDto(searchedRoomsResponse),
                };

                socket.emit('event:searchUsersAndGroups', validResponse(data));
            },
        );
    }

    searchMessages(io, socket) {
        socket.on('event:searchMessages', async dto => {
            if (
                errorInRequestDto(
                    socket,
                    'event:searchMessages',
                    dto,
                    Properties.ofSearchMessagesDto,
                )
            ) {
                return;
            }

            const userResponse = await UserService.getUserInfo(
                'info-of-one-by-email',
                dto.senderEmail,
            );

            if (errorDto(userResponse)) {
                socket.emit(
                    'event:searchMessages',
                    invalidResponse(userResponse),
                );
                return;
            }

            const { rooms } = userResponse;
            const isUserInRoom = rooms.some(
                room => objectIdToString(room) === dto.roomId,
            );

            if (!isUserInRoom) {
                socket.emit(
                    'event:searchMessages',
                    invalidResponse(
                        new ForbiddenError(
                            'You do not have permission to search messages in this chat group',
                        ),
                    ),
                );
                return;
            }

            const searchMessagesResponse = await MessageService.searchMessages(
                dto,
            );

            if (errorDto(searchMessagesResponse)) {
                socket.emit(
                    'event:searchMessages',
                    invalidResponse(searchMessagesResponse),
                );
                return;
            }

            socket.emit(
                'event:searchMessages',
                validResponse(
                    Preparation.forMessagesDto(searchMessagesResponse),
                ),
            );
        });
    }

    /**
     * ---------- HANDLE: ALL OTHERS ACTIONS IN GROUP CHAT ----------
     */

    updateGroupName(io, socket) {
        socket.on('event:updateGroupName', async dto => {
            if (
                errorInRequestDto(
                    socket,
                    'event:updateGroupName',
                    dto,
                    Properties.ofUpdateGroupNameDto,
                )
            ) {
                return;
            }

            const userResponse = await UserService.getUserInfo(
                'info-of-one-by-email',
                dto.senderEmail,
            );

            if (errorDto(userResponse)) {
                socket.emit(
                    'event:updateGroupName',
                    invalidResponse(userResponse),
                );
                return;
            }

            const { rooms } = userResponse;
            const isUserInRoom = rooms.some(
                room => objectIdToString(room) === dto.roomId,
            );

            if (!isUserInRoom) {
                socket.emit(
                    'event:updateGroupName',
                    invalidResponse(
                        new ForbiddenError(
                            'You do not have permission to change the name of this chat group',
                        ),
                    ),
                );
                return;
            }

            const updatedRoomResponse = await RoomService.updateRoomName(dto);

            if (errorDto(updatedRoomResponse)) {
                socket.emit(
                    'event:updateGroupName',
                    invalidResponse(updatedRoomResponse),
                );
                return;
            }

            this.socketRooms.set(
                updatedRoomResponse.roomId,
                updatedRoomResponse.newRoom,
            );

            io.to(updatedRoomResponse.oldRoom).emit(
                'event:updateGroupName',
                validResponse(updatedRoomResponse),
            );
        });
    }

    rejoinSocketRoom(io, socket) {
        socket.on('event:rejoinSocketRoom', dto => {
            if (
                errorInRequestDto(
                    socket,
                    'event:rejoinSocketRoom',
                    dto,
                    Properties.ofRejoinSocketRoomDto,
                )
            ) {
                return;
            }

            if (!TypeUtil.existsKeyInMap(this.socketRooms, dto.roomId)) {
                socket.emit(
                    'event:rejoinSocketRoom',
                    invalidResponse(
                        new BadRequestError(
                            'You can not join non-existent room',
                        ),
                    ),
                );
                return;
            }

            socket.leave(dto.oldRoom);
            socket.join(dto.newRoom);

            socket.emit('event:rejoinSocketRoom', validResponse());
        });
    }

    updateGroupThumbnail(io, socket) {
        socket.on('event:updateGroupThumbnail', async dto => {
            if (
                errorInRequestDto(
                    socket,
                    'event:updateGroupThumbnail',
                    dto,
                    Properties.ofUpdateGroupThumbnailDto,
                )
            ) {
                return;
            }

            const userResponse = await UserService.getUserInfo(
                'info-of-one-by-email',
                dto.senderEmail,
            );

            if (errorDto(userResponse)) {
                socket.emit(
                    'event:updateGroupThumbnail',
                    invalidResponse(userResponse),
                );
                return;
            }

            const roomResponse = await RoomService.getRoomInfo(
                'info-of-one-by-id',
                dto.roomId,
            );

            if (errorDto(roomResponse)) {
                socket.emit(
                    'event:updateGroupThumbnail',
                    invalidResponse(roomResponse),
                );
                return;
            }

            if (roomResponse.isPrivate) {
                socket.emit(
                    'event:updateGroupThumbnail',
                    invalidResponse(
                        new BadRequestError(
                            'You can not change the private group thumbnail',
                        ),
                    ),
                );
                return;
            }

            if (
                !TypeUtil.existsElementInArray(
                    roomResponse.members.map(member =>
                        objectIdToString(member),
                    ),
                    objectIdToString(userResponse._id),
                ) ||
                !TypeUtil.isEqual(dto.room, roomResponse.name)
            ) {
                socket.emit(
                    'event:updateGroupThumbnail',
                    invalidResponse(
                        new ForbiddenError(
                            'You do not have permission to change the thumbnail of this chat group',
                        ),
                    ),
                );
                return;
            }

            const updatedRoomResponse = await RoomService.updateRoomThumbnail(
                roomResponse,
                dto.thumbnail,
            );

            if (errorDto(updatedRoomResponse)) {
                socket.emit(
                    'event:updateGroupThumbnail',
                    invalidResponse(updatedRoomResponse),
                );
                return;
            }

            io.to(dto.room).emit(
                'event:updateGroupThumbnail',
                validResponse(
                    (({ roomId, thumbnail }) => ({ roomId, thumbnail }))(dto),
                ),
            );
        });
    }

    leaveGroup(io, socket) {
        socket.on('event:leaveGroup', async dto => {
            if (
                errorInRequestDto(
                    socket,
                    'event:leaveGroup',
                    dto,
                    Properties.ofLeaveGroupDto,
                )
            ) {
                return;
            }

            const userResponse = await UserService.getUserInfo(
                'info-of-one-by-email',
                dto.senderEmail,
            );

            if (errorDto(userResponse)) {
                socket.emit('event:leaveGroup', invalidResponse(userResponse));
                return;
            }

            const roomResponse = await RoomService.getRoomInfo(
                'info-of-one-by-id',
                dto.roomId,
            );

            if (errorDto(roomResponse)) {
                socket.emit('event:leaveGroup', invalidResponse(roomResponse));
                return;
            }

            if (roomResponse.isPrivate) {
                socket.emit(
                    'event:leaveGroup',
                    invalidResponse(
                        new BadRequestError(
                            'You can not leave a private group',
                        ),
                    ),
                );
                return;
            }

            if (
                TypeUtil.isEqual(
                    objectIdToString(userResponse._id),
                    objectIdToString(roomResponse.createdBy),
                )
            ) {
                socket.emit(
                    'event:leaveGroup',
                    invalidResponse(
                        new BadRequestError(
                            'You can not leave this group when you still are its admin',
                        ),
                    ),
                );
                return;
            }

            const { rooms } = userResponse;
            const isUserInRoom = rooms.some(
                room => dto.roomId === objectIdToString(room),
            );

            if (
                !TypeUtil.isEqual(dto.room, roomResponse.name) ||
                !isUserInRoom
            ) {
                socket.emit(
                    'event:leaveGroup',
                    invalidResponse(
                        new ForbiddenError(
                            'You do not have permission to leave this group',
                        ),
                    ),
                );
                return;
            }

            const leaveRoomResponse = await UserService.leaveRoom(
                userResponse._id,
                roomResponse._id,
            );

            if (errorDto(leaveRoomResponse)) {
                socket.emit(
                    'event:leaveGroup',
                    invalidResponse(leaveRoomResponse),
                );
                return;
            }

            const deleteMemberResponse = await RoomService.deleteMember(
                roomResponse._id,
                userResponse._id,
            );

            if (errorDto(deleteMemberResponse)) {
                socket.emit(
                    'event:leaveGroup',
                    invalidResponse(deleteMemberResponse),
                );
                return;
            }

            io.to(dto.room).emit(
                'event:leaveGroup',
                validResponse(Preparation.forUserDto(userResponse)),
            );

            socket.leave(dto.room);
        });
    }

    deleteGroup(io, socket) {
        socket.on('event:deleteGroup', async dto => {
            if (
                errorInRequestDto(
                    socket,
                    'event:deleteGroup',
                    dto,
                    Properties.ofDeleteGroupDto,
                )
            ) {
                return;
            }

            const userResponse = await UserService.getUserInfo(
                'info-of-one-by-email',
                dto.senderEmail,
            );

            if (errorDto(userResponse)) {
                socket.emit('event:deleteGroup', invalidResponse(userResponse));
                return;
            }

            const roomResponse = await RoomService.getRoomInfo(
                'info-of-one-by-id',
                dto.roomId,
            );

            if (errorDto(roomResponse)) {
                socket.emit('event:deleteGroup', invalidResponse(roomResponse));
                return;
            }

            if (roomResponse.isPrivate) {
                socket.emit(
                    'event:deleteGroup',
                    invalidResponse(
                        new BadRequestError(
                            'You can not delete a private group',
                        ),
                    ),
                );
                return;
            }

            if (
                !TypeUtil.isEqual(
                    objectIdToString(userResponse._id),
                    objectIdToString(roomResponse.createdBy),
                ) ||
                !TypeUtil.isEqual(dto.room, roomResponse.name)
            ) {
                socket.emit(
                    'event:deleteGroup',
                    invalidResponse(
                        new ForbiddenError(
                            'You do not have permission to delete this group',
                        ),
                    ),
                );
                return;
            }

            const deletedRoomResponse = await RoomService.deleteRoom(
                roomResponse._id,
            );

            if (errorDto(deletedRoomResponse)) {
                socket.emit(
                    'event:deleteGroup',
                    invalidResponse(deletedRoomResponse),
                );
                return;
            }

            const leaveRoomResponse = await UserService.leaveRoom(
                userResponse._id,
                roomResponse._id,
            );

            if (errorDto(leaveRoomResponse)) {
                socket.emit(
                    'event:deleteGroup',
                    invalidResponse(leaveRoomResponse),
                );
                return;
            }

            io.to(dto.room).emit(
                'event:deleteGroup',
                validResponse(deletedRoomResponse),
            );
        });
    }

    leaveDeletedGroup(io, socket) {
        socket.on('event:leaveDeletedGroup', async dto => {
            if (
                errorInRequestDto(
                    socket,
                    'event:leaveDeletedGroup',
                    dto,
                    Properties.ofLeaveDeletedGroupDto,
                )
            ) {
                return;
            }

            const userResponse = await UserService.getUserInfo(
                'info-of-one-by-email',
                dto.senderEmail,
            );

            if (errorDto(userResponse)) {
                socket.emit(
                    'event:leaveDeletedGroup',
                    invalidResponse(userResponse),
                );
                return;
            }

            if (
                !TypeUtil.existsKeyInMap(this.socketRooms, dto.roomId) ||
                !socket.rooms.has(dto.room)
            ) {
                socket.emit(
                    'event:leaveDeletedGroup',
                    invalidResponse(
                        new BadRequestError(
                            'You can not leave non-existent room',
                        ),
                    ),
                );
                return;
            }

            const leaveRoomResponse = await UserService.leaveRoom(
                userResponse._id,
                toObjectId(dto.roomId),
            );

            if (errorDto(leaveRoomResponse)) {
                socket.emit(
                    'event:leaveDeletedGroup',
                    invalidResponse(leaveRoomResponse),
                );
                return;
            }

            socket.leave(dto.room);
            this.socketRooms.delete(dto.roomId);

            socket.emit('event:leaveDeletedGroup', validResponse());
        });
    }

    addMembers(io, socket) {
        socket.on('event:addMembers', async dto => {
            if (
                errorInRequestDto(
                    socket,
                    'event:addMembers',
                    dto,
                    Properties.ofAddMembersDto,
                )
            ) {
                return;
            }

            const userResponse = await UserService.getUserInfo(
                'info-of-one-by-email',
                dto.senderEmail,
            );

            if (errorDto(userResponse)) {
                socket.emit('event:addMembers', invalidResponse(userResponse));
                return;
            }

            const roomResponse = await RoomService.getRoomInfo(
                'info-of-one-by-id',
                dto.roomId,
            );

            if (errorDto(roomResponse)) {
                socket.emit('event:addMembers', invalidResponse(roomResponse));
                return;
            }

            if (roomResponse.isPrivate) {
                socket.emit(
                    'event:addMembers',
                    invalidResponse(
                        new BadRequestError(
                            'You can not add members to the private group',
                        ),
                    ),
                );
                return;
            }

            if (
                !TypeUtil.existsElementInArray(
                    roomResponse.members.map(member =>
                        objectIdToString(member),
                    ),
                    objectIdToString(userResponse._id),
                ) ||
                !TypeUtil.isEqual(dto.room, roomResponse.name)
            ) {
                socket.emit(
                    'event:addMembers',
                    invalidResponse(
                        new ForbiddenError(
                            'You do not have permission to add members to this group',
                        ),
                    ),
                );
                return;
            }

            const newMembersResponse = await UserService.getUsersInfo(
                'info-of-many-by-emails',
                dto.userEmails,
            );

            if (errorDto(newMembersResponse)) {
                socket.emit(
                    'event:addMembers',
                    invalidResponse(newMembersResponse),
                );
                return;
            }

            const existedMembers = ArrayObjectUtil.filterElementsInArrOfObj(
                newMembersResponse,
                'rooms',
                objectIdToString(roomResponse._id),
                Preparation.forUserDto,
            );

            if (!TypeUtil.isEmptyArray(existedMembers)) {
                socket.emit(
                    'event:addMembers',
                    invalidResponse({
                        ...new BadRequestError(
                            'Some users have already been in this group',
                        ),
                        existedMembers,
                    }),
                );
                return;
            }

            const newMemberIds = newMembersResponse.map(user => user._id);

            try {
                await UserService.joinRoom(newMemberIds, roomResponse._id);
                await RoomService.addMembers(newMemberIds, roomResponse._id);
            } catch (error) {
                socket.emit(
                    'event:addMembers',
                    invalidResponse(
                        new InternalServerError(
                            'Getting internal error when trying to add members to group',
                        ),
                    ),
                );
                return;
            }

            const oldMembersResponse = await UserService.getUsersInfo(
                'info-of-many-by-ids',
                roomResponse.members.map(member => objectIdToString(member)),
            );

            if (errorDto(oldMembersResponse)) {
                socket.emit(
                    'event:addMembers',
                    invalidResponse(oldMembersResponse),
                );
            }

            const roomData = Preparation.forOneRoomDto(
                Preparation.forUsersDto(oldMembersResponse).concat(
                    Preparation.forUsersDto(newMembersResponse),
                ),
                roomResponse,
                await MessageService.getMessagesOfRoom(roomResponse._id),
            );

            dto.userEmails.forEach(email => {
                if (TypeUtil.existsKeyInMap(this.onlineUsers, email)) {
                    io.to(this.onlineUsers.get(email)).emit(
                        'event:addMembers',
                        validResponse(roomData),
                    );
                }
            });

            io.to(dto.room).emit(
                'event:addMembers',
                validResponse({
                    roomId: roomResponse._id,
                    newMembers: Preparation.forUsersDto(newMembersResponse),
                }),
            );
        });
    }

    deleteMember(io, socket) {
        socket.on('event:deleteMember', async dto => {
            if (
                errorInRequestDto(
                    socket,
                    'event:deleteMember',
                    dto,
                    Properties.ofDeleteMemberDto,
                )
            ) {
                return;
            }

            if (TypeUtil.isEqual(dto.senderEmail, dto.memberEmail)) {
                socket.emit(
                    'event:deleteMember',
                    invalidResponse(
                        new BadRequestError('You can not delete yourself'),
                    ),
                );
                return;
            }

            const userResponse = await UserService.getUserInfo(
                'info-of-one-by-email',
                dto.senderEmail,
            );

            if (errorDto(userResponse)) {
                socket.emit(
                    'event:deleteMember',
                    invalidResponse(userResponse),
                );
                return;
            }

            const roomResponse = await RoomService.getRoomInfo(
                'info-of-one-by-id',
                dto.roomId,
            );

            if (errorDto(roomResponse)) {
                socket.emit(
                    'event:deleteMember',
                    invalidResponse(roomResponse),
                );
                return;
            }

            if (roomResponse.isPrivate) {
                socket.emit(
                    'event:deleteMember',
                    invalidResponse(
                        new BadRequestError(
                            'You can not delete member from a private group',
                        ),
                    ),
                );
                return;
            }

            if (
                !TypeUtil.isEqual(
                    objectIdToString(userResponse._id),
                    objectIdToString(roomResponse.createdBy),
                ) ||
                !TypeUtil.isEqual(dto.room, roomResponse.name)
            ) {
                socket.emit(
                    'event:deleteMember',
                    invalidResponse(
                        new ForbiddenError(
                            'You do not have permission to delete member in this group',
                        ),
                    ),
                );
                return;
            }

            const beingDeletedMember = await UserService.getUserInfo(
                'info-of-one-by-email',
                dto.memberEmail,
            );
            const { rooms } = beingDeletedMember;
            const isMemberOfRoom = TypeUtil.existsElementInArray(
                rooms.map(room => objectIdToString(room)),
                dto.roomId,
            );

            if (!isMemberOfRoom) {
                socket.emit(
                    'event:deleteMember',
                    invalidResponse(
                        new BadRequestError(
                            'You can not delete this member since he/she is not in this group',
                        ),
                    ),
                );
                return;
            }

            const deleteMemberResponse = await RoomService.deleteMember(
                roomResponse._id,
                beingDeletedMember._id,
            );

            if (errorDto(deleteMemberResponse)) {
                socket.emit(
                    'event:deleteMember',
                    invalidResponse(deleteMemberResponse),
                );
                return;
            }

            const leaveRoomResponse = await UserService.leaveRoom(
                beingDeletedMember._id,
                roomResponse._id,
            );

            if (errorDto(leaveRoomResponse)) {
                socket.emit(
                    'event:deleteMember',
                    invalidResponse(leaveRoomResponse),
                );
                return;
            }

            io.to(dto.room).emit(
                'event:deleteMember',
                validResponse(
                    (({ roomId, room, memberEmail }) => ({
                        roomId,
                        room,
                        memberEmail,
                    }))(dto),
                ),
            );
        });
    }

    leaveSocketRoom(io, socket) {
        socket.on('event:leaveSocketRoom', dto => {
            if (
                errorInRequestDto(
                    socket,
                    'event:leaveSocketRoom',
                    dto,
                    Properties.ofLeaveSocketRoomDto,
                )
            ) {
                return;
            }

            if (!TypeUtil.existsKeyInMap(this.socketRooms, dto.roomId)) {
                socket.emit(
                    'event:leaveSocketRoom',
                    invalidResponse(
                        new BadRequestError(
                            'You can not leave non-existent room',
                        ),
                    ),
                );
                return;
            }

            socket.leave(dto.room);

            socket.emit('event:leaveSocketRoom', validResponse());
        });
    }

    grantAdminPrivilege(io, socket) {
        socket.on('event:grantAdminPrivilege', async dto => {
            if (
                errorInRequestDto(
                    socket,
                    'event:grantAdminPrivilege',
                    dto,
                    Properties.ofGrantAdminPrivilegeDto,
                )
            ) {
                return;
            }

            if (TypeUtil.isEqual(dto.senderEmail, dto.memberEmail)) {
                socket.emit(
                    'event:grantAdminPrivilege',
                    invalidResponse(
                        new BadRequestError(
                            'You have already been an admin of this group',
                        ),
                    ),
                );
                return;
            }

            const userResponse = await UserService.getUserInfo(
                'info-of-one-by-email',
                dto.senderEmail,
            );

            if (errorDto(userResponse)) {
                socket.emit(
                    'event:grantAdminPrivilege',
                    invalidResponse(userResponse),
                );
                return;
            }

            const roomResponse = await RoomService.getRoomInfo(
                'info-of-one-by-id',
                dto.roomId,
            );

            if (errorDto(roomResponse)) {
                socket.emit(
                    'event:grantAdminPrivilege',
                    invalidResponse(roomResponse),
                );
                return;
            }

            if (roomResponse.isPrivate) {
                socket.emit(
                    'event:grantAdminPrivilege',
                    invalidResponse(
                        new BadRequestError(
                            'You can not grant admin privilege within a private group',
                        ),
                    ),
                );
                return;
            }

            if (
                !TypeUtil.isEqual(
                    objectIdToString(userResponse._id),
                    objectIdToString(roomResponse.createdBy),
                ) ||
                !TypeUtil.isEqual(dto.room, roomResponse.name)
            ) {
                socket.emit(
                    'event:grantAdminPrivilege',
                    invalidResponse(
                        new ForbiddenError(
                            'You do not have permission to grant admin privilege to member in this group',
                        ),
                    ),
                );
                return;
            }

            const beingPromotedMember = await UserService.getUserInfo(
                'info-of-one-by-email',
                dto.memberEmail,
            );
            const { rooms } = beingPromotedMember;
            const isMemberOfRoom = TypeUtil.existsElementInArray(
                rooms.map(room => objectIdToString(room)),
                dto.roomId,
            );

            if (!isMemberOfRoom) {
                socket.emit(
                    'event:grantAdminPrivilege',
                    invalidResponse(
                        new BadRequestError(
                            'You can not grant admin privilege to this member since he/she is not in this group',
                        ),
                    ),
                );
                return;
            }

            const promoteResponse = await RoomService.grantAdminPrivilege(
                roomResponse,
                objectIdToString(beingPromotedMember._id),
            );

            if (errorDto(promoteResponse)) {
                socket.emit(
                    'event:grantAdminPrivilege',
                    invalidResponse(promoteResponse),
                );
                return;
            }

            io.to(dto.room).emit(
                'event:grantAdminPrivilege',
                validResponse({
                    msg: `User ${beingPromotedMember.name} is now admin of group ${roomResponse.name}`,
                }),
            );
        });
    }

    viewGroupFiles(io, socket) {
        socket.on('event:viewGroupFiles', async (fileType, dto) => {
            if (!fileType) {
                socket.emit(
                    'event:viewGroupFiles',
                    invalidResponse(new BadRequestError('Missing file type')),
                );
                return;
            }

            if (fileType !== 'media' && fileType !== 'file') {
                socket.emit(
                    'event:viewGroupFiles',
                    invalidResponse(
                        new BadRequestError(
                            // eslint-disable-next-line quotes
                            "File type must be 'media' or 'file'",
                        ),
                    ),
                );
                return;
            }

            if (
                errorInRequestDto(
                    socket,
                    'event:viewGroupFiles',
                    dto,
                    Properties.ofViewGroupFilesDto,
                )
            ) {
                return;
            }

            const userResponse = await UserService.getUserInfo(
                'info-of-one-by-email',
                dto.senderEmail,
            );

            if (errorDto(userResponse)) {
                socket.emit(
                    'event:viewGroupFiles',
                    invalidResponse(userResponse),
                );
                return;
            }

            const roomResponse = await RoomService.getRoomInfo(
                'info-of-one-by-id',
                dto.roomId,
            );

            if (errorDto(roomResponse)) {
                socket.emit(
                    'event:viewGroupFiles',
                    invalidResponse(roomResponse),
                );
                return;
            }

            if (
                !TypeUtil.existsElementInArray(
                    roomResponse.members.map(member =>
                        objectIdToString(member),
                    ),
                    objectIdToString(userResponse._id),
                )
            ) {
                socket.emit(
                    'event:viewGroupFiles',
                    invalidResponse(
                        new ForbiddenError(
                            'You do not have permission to view files in this group',
                        ),
                    ),
                );
                return;
            }

            let files;

            switch (fileType) {
                case 'media':
                    files = await MessageService.findImages(
                        objectIdToString(roomResponse._id),
                        PATTERN.CLOUDINARY_URL,
                    );
                    break;

                case 'file':
                    break;
            }

            if (errorDto(files)) {
                socket.emit('event:viewGroupFiles', invalidResponse(files));
                return;
            }

            socket.emit(
                'event:viewGroupFiles',
                validResponse(Preparation.forFilesDto(files)),
            );
        });
    }
}

export const WebSocketService = new WebSocketServiceImpl();
