export const mapToModelByMessageCreationDto = ({
    roomId,
    sender,
    content,
}) => ({
    room: roomId,
    sender,
    content,
});
