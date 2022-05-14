export const Properties = {
    ofNewMessageDto: ['roomId', 'room', 'senderEmail', 'content'],
    ofNewPrivateChatDto: ['senderEmail', 'receiverEmail', 'content'],
    ofNewGroupChatDto: ['name', 'memberEmails', 'senderEmail'],
    ofSearchUsersAndGroupsDto: ['term', 'senderEmail'],
    ofSearchMessagesDto: ['term', 'roomId', 'senderEmail'],
    ofUpdateGroupNameDto: ['roomId', 'senderEmail', 'newName'],
    ofUpdateGroupThumbnailDto: ['roomId', 'room', 'senderEmail', 'thumbnail'],
    ofLeaveGroupDto: ['roomId', 'room', 'senderEmail'],
    ofDeleteGroupDto: ['roomId', 'room', 'senderEmail'],
    ofJoinNewSocketRoomDto: ['roomId', 'room'],
    ofRejoinSocketRoomDto: ['roomId', 'oldRoom', 'newRoom'],
    ofLeaveDeletedGroupDto: ['roomId', 'room', 'senderEmail'],
    ofAddMembersDto: ['roomId', 'room', 'senderEmail', 'userEmails'],
    ofDeleteMemberDto: ['roomId', 'room', 'senderEmail', 'memberEmail'],
    ofLeaveSocketRoomDto: ['roomId', 'room'],
    ofGrantAdminPrivilegeDto: ['roomId', 'room', 'senderEmail', 'memberEmail'],
    ofViewGroupFilesDto: ['roomId', 'senderEmail'],
    ofSetPinMessageDto: ['roomId', 'room', 'senderEmail', 'messageId'],
    ofReplyToMessageDto: [
        'roomId',
        'room',
        'senderEmail',
        'content',
        'messageId',
    ],
    ofReactToMessageDto: [
        'roomId',
        'room',
        'senderEmail',
        'content',
        'messageId',
    ],
};

export const PATTERN = {
    CLOUDINARY_URL: 'https://res.cloudinary.com',
};
