const AppHandler = {
    /**
     * Query DOM
     */
    chatList: document.querySelector('#chat-list'),
    roomContent: document.querySelector('#nav-tabContent'),
    searchBox: document.querySelector('.searchBox'),
    /**
     * Render UI
     */
    renderChatList() {
        const rooms = this.arrayFromMap(this.data);

        if (!rooms.length) {
            this.chatList.innerHTML = `
                <p>No discussions available</p>
            `;
            return;
        }

        const htmls = rooms.map(
            room => `
            <div class="list-group roomBox" id="${room.id}" role="tablist">
                <a
                    href="javascript:void(0)"
                    class="filterDiscussions all unread single active"
                >
                    <img
                        class="avatar-md"
                        src="/dist/img/avatars/avatar-male-1.jpg"
                        data-toggle="tooltip"
                        data-placement="top"
                        title=${room.name}
                        alt="avatar"
                    />
                    <div class="status">
                        <i class="material-icons online"
                            >fiber_manual_record</i
                        >
                    </div>
                    <div class="new bg-yellow">
                        <span>+7</span>
                    </div>
                    <div class="data">
                        <h5>${room.name}</h5>
                        <span>Mon</span>
                        <p>
                            New messages
                        </p>
                    </div>
                </a>
            </div>
        `,
        );

        this.chatList.innerHTML = htmls.join('');

        this.handleChatListEvent(rooms);
    },
    renderRoomContent(room) {
        const topHtml = `
            <div class="inside">
                <a href="#"
                    ><img
                        class="avatar-md"
                        src="/dist/img/avatars/avatar-male-1.jpg"
                        data-toggle="tooltip"
                        data-placement="top"
                        title="Keith"
                        alt="avatar"
                /></a>
                <div class="status">
                    <i class="material-icons online"
                        >fiber_manual_record</i
                    >
                </div>
                <div class="data">
                    <h5><a href="#">${room.name}</a></h5>
                    <span>Active now</span>
                </div>
                <button
                    class="btn connect d-md-block d-none"
                    name="1"
                >
                    <i class="material-icons md-30"
                        >phone_in_talk</i
                    >
                </button>
                <button
                    class="btn connect d-md-block d-none"
                    name="1"
                >
                    <i class="material-icons md-36">videocam</i>
                </button>
                <button class="btn d-md-block d-none">
                    <i class="material-icons md-30">info</i>
                </button>
                <div class="dropdown">
                    <button
                        class="btn"
                        data-toggle="dropdown"
                        aria-haspopup="true"
                        aria-expanded="false"
                    >
                        <i class="material-icons md-30"
                            >more_vert</i
                        >
                    </button>
                    <div class="dropdown-menu dropdown-menu-right">
                        <button
                            class="dropdown-item connect"
                            name="1"
                        >
                            <i class="material-icons"
                                >phone_in_talk</i
                            >Voice Call
                        </button>
                        <button
                            class="dropdown-item connect"
                            name="1"
                        >
                            <i class="material-icons">videocam</i
                            >Video Call
                        </button>
                        <hr />
                        <button class="dropdown-item">
                            <i class="material-icons">clear</i>Clear
                            History
                        </button>
                        <button class="dropdown-item">
                            <i class="material-icons">block</i>Block
                            Contact
                        </button>
                        <button class="dropdown-item">
                            <i class="material-icons">delete</i
                            >Delete Contact
                        </button>
                    </div>
                </div>
            </div>
        `;

        const chatHtmls = room.messages.map(message => {
            switch (message.sender) {
                case this.storage().name:
                    return `
                        <div class="message me">
                            <div class="text-main">
                                <div class="text-group me">
                                    <div class="text me">
                                        <p>
                                            ${message.content}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;

                default:
                    return `
                        <div class="message">
                            <img
                                class="avatar-md"
                                src="/dist/img/avatars/avatar-male-1.jpg"
                                data-toggle="tooltip"
                                data-placement="top"
                                title="Keith"
                                alt="avatar"
                            />
                            <div class="text-main">
                                <div class="text-group">
                                    <div class="text">
                                        <p>
                                            ${message.content}
                                        </p>
                                    </div>
                                </div>
                                <span>${message.sender}</span>
                            </div>
                        </div>
                    `;
            }
        });

        this.roomContent.innerHTML = `
            <div
                class="babble tab-pane fade active show"
                role="tabpanel"
                aria-labelledby="list-chat-list"
            >
                <div class="chat" id="chat1">
                    <div class="top">
                        <div class="container">
                            <div class="col-md-12">
                                ${topHtml}
                            </div>
                        </div>
                    </div>
                    <div class="content" id="content">
                        <div class="container">
                            <div class="col-md-12">
                                ${chatHtmls.join('')}
                            </div>
                        </div>
                    </div>
                    <div class="container">
                        <div class="col-md-12">
                            <div class="bottom">
                                <form class="position-relative w-100 sendMessageForm ${
                                    room.id
                                }" id="${room.name}">
                                    <textarea
                                        class="form-control"
                                        placeholder="Start typing for reply..."
                                        rows="1"
                                    ></textarea>
                                    <button class="btn emoticons">
                                        <i class="material-icons">insert_emoticon</i>
                                    </button>
                                    <button type="submit" class="btn send">
                                        <i class="material-icons">send</i>
                                    </button>
                                </form>
                                <label>
                                    <input type="file" />
                                    <span class="btn attach d-sm-block d-none"
                                        ><i class="material-icons">attach_file</i></span
                                    >
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.handleRoomContentEvent();
    },
    renderUser(user) {
        this.chatList.innerHTML = `
            <div class="list-group userBox" id="${user._id}" role="tablist">
                <a
                    href="javascript:void(0)"
                    class="filterDiscussions all unread single active"
                >
                    <img
                        class="avatar-md"
                        src="/dist/img/avatars/avatar-male-1.jpg"
                        data-toggle="tooltip"
                        data-placement="top"
                        title=${user.name}
                        alt="avatar"
                    />
                    <div class="status">
                        <i class="material-icons online"
                            >fiber_manual_record</i
                        >
                    </div>
                    <div class="new bg-yellow">
                        <span>+7</span>
                    </div>
                    <div class="data">
                        <h5>${user.name}</h5>
                    </div>
                </a>
            </div>
        `;

        document.querySelector('.userBox').addEventListener('click', () => {
            this.renderEmptyRoomContent(user);
        });
    },
    renderEmptyRoomContent(user) {
        const topHtml = `
            <div class="inside">
                <a href="#"
                    ><img
                        class="avatar-md"
                        src="/dist/img/avatars/avatar-male-1.jpg"
                        data-toggle="tooltip"
                        data-placement="top"
                        title="Keith"
                        alt="avatar"
                /></a>
                <div class="status">
                    <i class="material-icons online"
                        >fiber_manual_record</i
                    >
                </div>
                <div class="data">
                    <h5><a href="#">${user.name}</a></h5>
                    <span>Active now</span>
                </div>
                <button
                    class="btn connect d-md-block d-none"
                    name="1"
                >
                    <i class="material-icons md-30"
                        >phone_in_talk</i
                    >
                </button>
                <button
                    class="btn connect d-md-block d-none"
                    name="1"
                >
                    <i class="material-icons md-36">videocam</i>
                </button>
                <button class="btn d-md-block d-none">
                    <i class="material-icons md-30">info</i>
                </button>
                <div class="dropdown">
                    <button
                        class="btn"
                        data-toggle="dropdown"
                        aria-haspopup="true"
                        aria-expanded="false"
                    >
                        <i class="material-icons md-30"
                            >more_vert</i
                        >
                    </button>
                    <div class="dropdown-menu dropdown-menu-right">
                        <button
                            class="dropdown-item connect"
                            name="1"
                        >
                            <i class="material-icons"
                                >phone_in_talk</i
                            >Voice Call
                        </button>
                        <button
                            class="dropdown-item connect"
                            name="1"
                        >
                            <i class="material-icons">videocam</i
                            >Video Call
                        </button>
                        <hr />
                        <button class="dropdown-item">
                            <i class="material-icons">clear</i>Clear
                            History
                        </button>
                        <button class="dropdown-item">
                            <i class="material-icons">block</i>Block
                            Contact
                        </button>
                        <button class="dropdown-item">
                            <i class="material-icons">delete</i
                            >Delete Contact
                        </button>
                    </div>
                </div>
            </div>
        `;

        this.roomContent.innerHTML = `
            <div
                class="babble tab-pane fade active show"
                role="tabpanel"
                aria-labelledby="list-chat-list"
            >
                <div class="chat" id="chat1">
                    <div class="top">
                        <div class="container">
                            <div class="col-md-12">
                                ${topHtml}
                            </div>
                        </div>
                    </div>
                    <div class="content" id="content">
                        <div class="container">
                            <div class="col-md-12"></div>
                        </div>
                    </div>
                    <div class="container">
                        <div class="col-md-12">
                            <div class="bottom">
                                <form class="position-relative w-100 sendMessageForm" id="${user.email}">
                                    <textarea
                                        class="form-control"
                                        placeholder="Start typing for reply..."
                                        rows="1"
                                    ></textarea>
                                    <button class="btn emoticons">
                                        <i class="material-icons">insert_emoticon</i>
                                    </button>
                                    <button type="submit" class="btn send">
                                        <i class="material-icons">send</i>
                                    </button>
                                </form>
                                <label>
                                    <input type="file" />
                                    <span class="btn attach d-sm-block d-none"
                                        ><i class="material-icons">attach_file</i></span
                                    >
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.handleNewConversationsEvent(user);
    },
    /**
     * Resources
     */
    storage() {
        return JSON.parse(localStorage.getItem('user'));
    },
    data: null,
    cache: false,
    /**
     * Handle events
     */
    handleNewConversationsEvent(user) {
        this.scrollToBottom(document.getElementById('content'));

        const inputMessageForm = document.querySelector('.sendMessageForm');
        const inputMessage = document.querySelector(
            '.sendMessageForm textarea',
        );

        inputMessageForm.addEventListener('submit', e => {
            e.preventDefault();

            const message = {
                sender: this.storage().email,
                receiver: inputMessageForm.id,
                content: inputMessage.value,
            };

            this.socket.emit('event:privateMessaging', message);
        });
    },
    handleChatListEvent(rooms) {
        const roomBoxes = document.querySelectorAll('.roomBox');

        roomBoxes.forEach((roomBox, index) => {
            roomBox.addEventListener('click', () => {
                if (this.isEqual(roomBox.id, rooms[index].id)) {
                    this.renderRoomContent(rooms[index]);
                }
            });
        });
    },
    handleRoomContentEvent() {
        this.scrollToBottom(document.getElementById('content'));

        const inputMessageForm = document.querySelector('.sendMessageForm');
        const inputMessage = document.querySelector(
            '.sendMessageForm textarea',
        );

        inputMessageForm.addEventListener('submit', e => {
            e.preventDefault();

            const message = {
                roomId: inputMessageForm.classList.item(3),
                room: inputMessageForm.id,
                sender: this.storage().name,
                content: inputMessage.value,
            };

            this.socket.emit('event:groupMessaging', message);
        });
    },
    handleSearchAllEvent() {
        this.searchBox.addEventListener('change', () => {
            this.socket.emit(
                'event:searchForUsersAndConversations',
                'all',
                this.searchBox.value,
            );
        });
    },
    handleEventsFromServer() {
        this.socket.on('event:getAllConversations', async response => {
            if (!response.success) {
                console.log('event:getAllConversations', response);
                return;
            }
            console.log(response);
            this.data = await this.createMapFromConversationsData(
                response.data,
            );
            this.renderChatList();
            this.renderRoomContent(this.firstValuesOfMap(this.data));
        });

        this.socket.on('event:groupMessaging', async response => {
            if (!response.success) {
                console.log('event:groupMessaging', response);
                return;
            }

            console.log('event:groupMessaging', response);

            // this.data.get(response.data.room.toString()).messages.push({
            //     sender: response.data.sender,
            //     content: response.data.content,
            //     createdAt: response.data.createdAt,
            // });

            // this.data = await this.createMapFromConversationsData(
            //     await this.sortRoomsByMessagesDateCreated(
            //         this.arrayFromMap(this.data),
            //     ),
            // );

            // this.renderChatList();
        });

        this.socket.on('event:searchUsersAndGroups', response => {
            if (!response.success) {
                console.log('event:searchUsersAndConversations', response);
                return;
            }

            console.log('event:searchUsersAndConversations', response);
        });

        this.socket.on('event:privateMessaging', response => {
            if (!response.success) {
                console.log('event:privateMessaging', response);
                return;
            }

            console.log('event:privateMessaging', response);

            this.socket.emit('event:joinNewSocketRoom', {
                room: response.data.name,
                roomId: response.data.id,
            });

            // if (this.storage().email === 'minhdong@gmail.com') {
            //     if (this.cache) {
            //         return;
            //     }
            //     this.cache = true;

            //     setTimeout(() => {
            //         this.socket.emit('event:privateMessaging', {
            //             roomId: response.id,
            //             room: response.name,
            //             sender: 'Minh Dong',
            //             content: 'chi mi',
            //         });
            //     }, 2000);
            // }
        });

        this.socket.on('event:createNewGroup', response => {
            if (!response.success) {
                console.log('event:createNewGroup', response);
                return;
            }
            console.log('event:createNewGroup', response);

            this.socket.emit('event:joinNewSocketRoom', {
                room: response.data.name,
                roomId: response.data.id,
            });
        });

        this.socket.on('event:joinNewSocketRoom', response => {
            if (!response.success) {
                console.log('event:joinNewSocketRoom', response);
                return;
            }
            console.log('event:joinNewSocketRoom', response);
        });

        this.socket.on('event:rejoinSocketRoom', response => {
            if (!response.success) {
                console.log('event:rejoinSocketRoom', response);
                return;
            }
            console.log('event:rejoinSocketRoom', response);
        });

        this.socket.on('event:searchMessages', response => {
            if (!response.success) {
                console.log('event:searchMessages', response);
                return;
            }
            console.log('event:searchMessages', response);
        });

        this.socket.on('event:updateGroupName', response => {
            if (!response.success) {
                console.log('event:updateGroupName', response);
                return;
            }
            console.log('event:updateGroupName', response);
            this.socket.emit('event:rejoinSocketRoom', response.data);
        });

        this.socket.on('event:leaveGroup', response => {
            if (!response.success) {
                console.log('event:leaveGroup', response);
                return;
            }
            console.log('event:leaveGroup', response);
        });

        this.socket.on('event:deleteGroup', response => {
            if (!response.success) {
                console.log('event:deleteGroup', response);
                return;
            }
            console.log('event:deleteGroup', response);

            this.socket.emit('event:leaveDeletedGroup', {
                roomId: response.data.id,
                room: response.data.name,
                senderEmail: this.storage().email,
            });
        });

        this.socket.on('event:leaveDeletedGroup', response => {
            if (!response.success) {
                console.log('event:leaveDeletedGroup', response);
                return;
            }
            console.log('event:leaveDeletedGroup', response);
        });

        this.socket.on('event:addMembers', response => {
            if (!response.success) {
                console.log('event:addMembers', response);
                return;
            }
            console.log('event:addMembers', response);
        });

        this.socket.on('event:deleteMember', response => {
            if (!response.success) {
                console.log('event:deleteMember', response);
                return;
            }
            console.log('event:deleteMember', response);

            if (this.storage().email === 'duchuy@gmail.com') {
                this.socket.emit(
                    'event:leaveSocketRoom',
                    (({ roomId, room }) => ({ roomId, room }))(response.data),
                );
            }
        });

        this.socket.on('event:leaveSocketRoom', response => {
            if (!response.success) {
                console.log('event:leaveSocketRoom', response);
                return;
            }
            console.log('event:leaveSocketRoom', response);
        });

        this.socket.on('event:grantAdminPrivilege', response => {
            if (!response.success) {
                console.log('event:grantAdminPrivilege', response);
                return;
            }
            console.log('event:grantAdminPrivilege', response);
        });

        this.socket.on('event:setPinMessage', response => {
            if (!response.success) {
                console.log('event:setPinMessage', response);
                return;
            }
            console.log('event:setPinMessage', response);
        });

        this.socket.on('event:replyToMessage', response => {
            if (!response.success) {
                console.log('event:replyToMessage', response);
                return;
            }
            console.log('event:replyToMessage', response);
        });

        this.socket.on('event:reactToMessage', response => {
            if (!response.success) {
                console.log('event:reactToMessage', response);
                return;
            }
            console.log('event:reactToMessage', response);
        });

        this.socket.on('event:typing', response => {
            if (!response.success) {
                console.log('event:typing', response);
                return;
            }
            console.log('event:typing', response);
        });

        this.socket.on('event:updateGroupThumbnail', response => {
            if (!response.success) {
                console.log('event:updateGroupThumbnail', response);
                return;
            }
            console.log('event:updateGroupThumbnail', response);
        });

        this.socket.on('event:viewGroupFiles', response => {
            if (!response.success) {
                console.log('event:viewGroupFiles', response);
                return;
            }
            console.log('event:viewGroupFiles', response);
        });
    },
    /**
     * Utilities
     */
    scrollToBottom(el) {
        el.scrollTop = el.scrollHeight;
    },
    firstElementOfArr(arr) {
        return arr[0];
    },
    firstValuesOfMap() {
        return this.data.values().next().value;
    },
    isEqual(a, b) {
        return a === b;
    },
    convertISODateStringToDateObject(data) {
        data.forEach(el => {
            el.messages.forEach(message => {
                message.createdAt = new Date(message.createdAt);
            });
        });
        return data;
    },
    defer(thisArg, fn) {
        setTimeout(() => {
            fn.call(thisArg);
        }, 3000);
    },
    arrayFromMap(map) {
        return Array.from(map.values());
    },
    async createMapFromConversationsData(arr) {
        return new Map(arr.map(el => [el.id, el]));
    },
    async sortRoomsByMessagesDateCreated(data) {
        return data.sort(
            (a, b) =>
                Date.parse(b.messages[b.messages.length - 1].createdAt) -
                Date.parse(a.messages[a.messages.length - 1].createdAt),
        );
    },
    /**
     * Init web socket client
     */
    socket: io(),
    /**
     * Run scripts
     */
    start() {
        this.socket.emit(
            'event:authenticateUser',
            `Bearer ${this.storage().accessToken}`,
        );

        this.socket.on('event:authenticateUser', response => {
            if (!response.success) {
                console.log(response);
            }
        });

        this.handleEventsFromServer();

        // setTimeout(() => {
        //     (() => {
        //         if (this.storage().email === 'tiendung@gmail.com') {
        //             this.socket.emit('event:updateGroupThumbnail', {
        //                 senderEmail: 'tiendung@gmail.com',
        //                 roomId: '6208b87bd8d0b4d3907007a1',
        //                 room: 'i54xa',
        //                 thumbnail: 'Wtf',
        //             });
        //         }
        //     })();
        // }, 3000);
    },
};

AppHandler.start();
