import { LoggerFactory } from 'package/logger';
import { WebSocketService } from 'core/modules/web-socket';

export class SocketIo {
    run(io) {
        const onConnection = socket => {
            socket.on('event:authenticateUser', accessToken => {
                WebSocketService.jwtAuthenticationMiddleware(
                    io,
                    socket,
                    accessToken,
                    WebSocketService.getAllConversations,
                    WebSocketService.broadcastTyping,
                    WebSocketService.groupMessaging,
                    WebSocketService.privateMessaging,
                    WebSocketService.setPinMessage,
                    WebSocketService.replyToMessage,
                    WebSocketService.reactToMessage,
                    WebSocketService.searchUsersAndGroups,
                    WebSocketService.searchMessages,
                    WebSocketService.createNewGroup,
                    WebSocketService.joinNewSocketRoom,
                    WebSocketService.updateGroupName,
                    WebSocketService.updateGroupThumbnail,
                    WebSocketService.rejoinSocketRoom,
                    WebSocketService.leaveGroup,
                    WebSocketService.deleteGroup,
                    WebSocketService.leaveDeletedGroup,
                    WebSocketService.addMembers,
                    WebSocketService.deleteMember,
                    WebSocketService.leaveSocketRoom,
                    WebSocketService.grantAdminPrivilege,
                    WebSocketService.viewGroupFiles,
                );
            });
        };

        io.on('connection', onConnection);

        LoggerFactory.globalLogger.info('Init socket io server');
    }
}
