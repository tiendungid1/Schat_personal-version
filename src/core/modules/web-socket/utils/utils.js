import { TypeUtil } from 'core/utils';

export function sortRoomsByMessagesDateCreated(data) {
    // eslint-disable-next-line array-callback-return
    return data.sort((a, b) => {
        if (
            // eslint-disable-next-line operator-linebreak
            !TypeUtil.isEmptyArray(b.messages) &&
            !TypeUtil.isEmptyArray(a.messages)
        ) {
            return (
                // eslint-disable-next-line operator-linebreak
                Date.parse(b.messages[b.messages.length - 1].createdAt) -
                Date.parse(a.messages[a.messages.length - 1].createdAt)
            );
        }
    });
}
