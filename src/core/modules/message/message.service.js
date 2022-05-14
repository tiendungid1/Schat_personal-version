/* eslint-disable implicit-arrow-linebreak */
import {
    DataPersistenceService,
    documentCleanerVisitor,
} from 'package/restBuilder/core/dataHandler';
import { TypeUtil } from 'core/utils';
import {
    BadRequestError,
    InternalServerError,
} from '../web-socket/response/exception';
import { MessageRepository } from './message.repository';
import { mapToModelByMessageCreationDto } from './dto';
import { objectIdToString, toObjectId } from '../mongoose/utils/objectId.utils';

class MessageServiceImpl extends DataPersistenceService {
    constructor() {
        super(MessageRepository);
    }

    async getMessagesOfRooms(roomIds) {
        let messages;

        try {
            messages = await this.repository.getMessagesByIds(roomIds);
        } catch (error) {
            return new InternalServerError(
                'Getting internal error when trying to get messages of chat groups',
            );
        }

        return messages;
    }

    async getMessagesOfRoom(roomId) {
        let messages;

        try {
            messages = await this.repository.getMessagesById(roomId);
        } catch (error) {
            return new InternalServerError(
                'Getting internal error when trying to get messages of chat groups',
            );
        }

        return messages;
    }

    async getOne(messageId) {
        let message;

        try {
            message = await this.repository.getById(messageId);
        } catch (error) {
            return new InternalServerError(
                'Getting internal error when trying to get message info',
            );
        }

        if (!message) {
            return new BadRequestError('This message does not exist');
        }

        return message;
    }

    async getMany(messageIds) {
        let messages;

        try {
            messages = await this.repository.getByIds(messageIds);
        } catch (error) {
            return new InternalServerError(
                'Getting internal error when trying to get message info',
            );
        }

        if (!TypeUtil.isEqual(messages.length, messageIds.length)) {
            return new BadRequestError('Some messages do not exist');
        }

        return messages;
    }

    async createOne(messageDto) {
        const mappedToModel = documentCleanerVisitor(
            mapToModelByMessageCreationDto(messageDto),
        );

        return this.createOneSafety(mappedToModel);
    }

    async createOneWithReply(newMessageDto, replyMessageDto) {
        const mappedToModel = {
            ...mapToModelByMessageCreationDto(newMessageDto),
            reply: {
                id: objectIdToString(replyMessageDto._id),
                content: replyMessageDto.content,
            },
        };

        return this.createOneSafety(documentCleanerVisitor(mappedToModel));
    }

    async searchMessages(dto) {
        let searchedMessages;

        try {
            searchedMessages = await this.repository.searchByText(
                dto.term,
                toObjectId(dto.roomId),
            );
        } catch (error) {
            return new InternalServerError(
                'Getting internal error while trying to search for messages',
            );
        }

        return searchedMessages;
    }

    async setPinMessage(message) {
        try {
            await this.patchOne(message._id, message, {
                isPinned: true,
            });
        } catch (error) {
            return new InternalServerError(
                'Getting internal error while trying to set pin message',
            );
        }
    }

    async setReactionForMessage({ _id }, { name, ava, content }) {
        try {
            await this.updateArrayFieldOfOne(
                'push',
                { _id },
                {
                    reaction: {
                        sender: name,
                        ava,
                        content,
                    },
                },
            );
        } catch (error) {
            return new InternalServerError(
                'Getting internal error while trying to set reaction for message',
            );
        }
    }

    async findImages(roomId, pattern) {
        let images;

        try {
            images = await this.repository.getMessagesByRegex(roomId, pattern);
        } catch (error) {
            return new InternalServerError(
                'Getting internal error while trying to get images in group',
            );
        }

        return images;
    }
}

export const MessageService = new MessageServiceImpl();
