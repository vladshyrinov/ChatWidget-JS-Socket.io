/* jslint esversion: 6*/

;
(() => {

    /*********** GETTING THE DOM BLOCKS START ***************/

    const chatWidget = document.getElementById('chat-widget');

    chatWidget.innerHTML = `
    <button type="button" class="open-chat-btn mbtn">
    <i class="fa fa-window-maximize"></i>
</button>
<div class="chats-content">
    <section class="chats-top d-flex">
        <div class="chats-inscription">Chats</div>
        <button class="close-cross mbtn" type="button">
            <i class="fa fa-lg fa-close"></i>
        </button>
    </section>
    <section class="chats">   
    </section>
</div>
<div class="chat-content">
    <section class="chat-top d-flex">
        <button class="back-arrow mbtn" type="button">
            <i class="fa fa-lg fa-arrow-left"></i>
        </button>
        <div class="contact-name"></div>
        <button class="close-cross mbtn" type="button">
            <i class="fa fa-lg fa-close"></i>
        </button>
    </section>
    <section class="chat-box">
    </section>
    <section class="d-flex">
        <textarea class="chat-msg" type="text" placeholder="Введите сообщение"></textarea>
        <button class="send-msg-btn mbtn" type="button">
            <i class="fa fa-lg fa-send-o"></i>
        </button>
    </section>
</div>`;

    const chatBox = document.getElementsByClassName('chat-box')[0];
    const chatMsg = document.getElementsByClassName('chat-msg')[0];
    const sendMsgBtn = document.getElementsByClassName('send-msg-btn')[0];
    const headElem = document.head;
    const contactNameElem = document.getElementsByClassName('contact-name')[0];
    const chatContent = document.getElementsByClassName('chat-content')[0];
    const chatsContent = document.getElementsByClassName('chats-content')[0];
    const openChatBtn = document.getElementsByClassName('open-chat-btn')[0];
    const closeChatCross = [].slice.call(document.getElementsByClassName('close-cross'));
    const backArrowElem = document.getElementsByClassName('back-arrow')[0];
    const chatsElem = document.getElementsByClassName('chats')[0];

    /*********** GETTING THE DOM BLOCKS END ***************/


    /************* CSS INITIALIZATION START **************** */

    const fontAwesomeLink = cssElemInitialiser("https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css");
    const bootstrapLink = cssElemInitialiser("https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/4.0.0-beta/css/bootstrap.min.css");

    headElem.appendChild(bootstrapLink);
    headElem.appendChild(fontAwesomeLink);


    function cssElemInitialiser(cssLink) {
        const cssEl = document.createElement('link');
        cssEl.rel = 'stylesheet';
        cssEl.type = 'text/css';
        cssEl.href = cssLink;
        return cssEl;
    }

    /************* CSS INITIALIZATION END **************** */


    /********* SOCKET START *************/

    const port = 3000;
    const socket = io.connect('http://localhost:' + port);
    const location = window.location.href;

    let userName = location.indexOf('.html') !== -1 ?
        location.substring(location.indexOf(port + "") + 5, location.indexOf(".html")) : "Main";

    userName = userName.charAt(0).toUpperCase() + userName.substring(1);
    let room = 'Main';
    contactNameElem.innerText = room;

    socket.emit('defineUser', userName);

    socket.on('messageToClients', (name, msg) => {
        let contacts = [];
        let messages = [];
        const message = name + " : " + msg;

        if (userName === 'Main') {
            if (room === name) {
                insertMessage(chatBox, message);
            }
        } else {
            insertMessage(chatBox, message);
        }
        if (!lsGetItem(userName) && !lsGetItem(name)) {
            messages.push(message);
            if (userName === 'Main') {
                lsSetItem(name, strJSON(messages));
            } else {
                lsSetItem(userName, strJSON(messages));
            }
        } else {
            if (userName === 'Main') {
                messages = prsJSON(lsGetItem(name));
                messages.push(message);
                lsSetItem(name, strJSON(messages));
            } else {
                messages = prsJSON(lsGetItem(userName));
                messages.push(message);
                lsSetItem(userName, strJSON(messages));
            }
        }

        const contactsKey = userName + 'Contacts';

        if (!lsGetItem(contactsKey)) {
            contacts.push(name)
            lsSetItem(contactsKey, strJSON(contacts));
            insertContact(chatsElem, name, userName);
        } else {
            contacts = prsJSON(lsGetItem(contactsKey));
            let contactFlag = contacts.some((contact) => {
                return contact === name;
            });
            if (!contactFlag) {
                contacts.push(name);
                lsSetItem(contactsKey, strJSON(contacts));
                insertContact(chatsElem, name, userName);
            } else {
                contacts.forEach((contact) => {
                    if (contact === name) {
                        const msgField = document.querySelector(".contact[data-contact=" + "'" + name + "'" + "] p");
                        msgField.innerText = message;
                    }
                });
            }
        }

    });

    /**************SOCKET END*********************/

    /******* WINDOW STATE REMEMERING START**********/

    let initialDefaultState = {
        open: 'stub',
        chats: 'none',
        chat: 'none',
        chatRoom: 'none'
    };

    function checkStartState() {
        const stateName = userName + 'State';
        let state = lsGetItem(stateName);
        if (!state) {
            state = initialDefaultState;
            lsSetItem(stateName, strJSON(state));
        } else {
            state = prsJSON(lsGetItem(stateName));
        }
        openChatBtn.classList.add(state.open);
        chatContent.classList.add(state.chat);
        chatsContent.classList.add(state.chats);
        if(state.chat === 'stub') {
            room = state.chatRoom;
            retrieveMessages();
            contactNameElem.innerText = room;
        }
    }

    checkStartState();


    chatWidget.addEventListener('click', (event) => {
        const stateName = userName + 'State';
        let state = prsJSON(lsGetItem(stateName));
        const target = event.target;

        switch (target) {
            case openChatBtn:
            case openChatBtn.children[0]:
            case backArrowElem:
            case backArrowElem.children[0]:
                state = {
                    open: 'none',
                    chats: 'stub',
                    chat: 'none',
                    chatRoom: 'none'
                };
                lsSetItem(stateName, strJSON(state));
                break;
            case closeChatCross[0]:
            case closeChatCross[0].children[0]:
            case closeChatCross[1]:
            case closeChatCross[1].children[0]:
                state = initialDefaultState;
                lsSetItem(stateName, strJSON(state));
                break;
            default:
                break;
        }

        if (target.getAttribute('class') === 'contact' ||
            target.parentElement.getAttribute('class') === 'contact') {
            let chatName;
            if (target.getAttribute('class') === 'contact') {
                chatName = target.children[0].innerText;
            } else {
                chatName = target.parentElement.children[0].innerText;
            }
            state = {
                open: 'none',
                chats: 'none',
                chat: 'stub',
                chatRoom: chatName
            };
            lsSetItem(stateName, strJSON(state));
        }

    });


    /******* WINDOW STATE REMEMERING END**********/


    /************STATE CHANGING ACTIONS START***************/

    sendMsgBtn.addEventListener('click', handleMessageSend);
    chatMsg.addEventListener('keydown', handleMessageSend);

    openChatBtn.addEventListener('click', () => {
        chatsContent.classList.remove('none');
        openChatBtn.classList.add('none');
        chatContent.classList.add('none');
        retrieveContacts();
    });

    closeChatCross.forEach((el) => {
        el.addEventListener('click', () => {
            chatContent.classList.add('none');
            chatsContent.classList.add('none');
            openChatBtn.classList.remove('none');
        });
    });

    backArrowElem.addEventListener('click', () => {
        chatContent.classList.add('none');
        chatsContent.classList.remove('none');
        openChatBtn.classList.add('none');
        retrieveContacts();
    });

    /************STATE CHANGING ACTIONS END***************/

    /***********MESSAGES AND CONTACTs RETRIEVING START****************/


    function retrieveMessages() {
        let messages = [];
        if (lsGetItem(room) || lsGetItem(userName)) {
            if (userName === 'Main') {
                messages = prsJSON(lsGetItem(room));
            } else {
                messages = prsJSON(lsGetItem(userName));
            }
            chatBox.innerHTML = "";
            if (messages) {
                messages.forEach(message => {
                    insertMessage(chatBox, message);
                });
            }
        }
    }

    function retrieveContacts() {
        chatsElem.innerHTML = "";
        let contacts = [];
        const contactsStr = lsGetItem(userName + 'Contacts');
        if (contactsStr) {
            contacts = prsJSON(contactsStr);
            contacts.forEach((contact) => {
                insertContact(chatsElem, contact, userName);
            });
        } else {
            if (userName !== 'Main') {
                contacts.push('Main');
                lsSetItem(userName + 'Contacts', strJSON(contacts));
                insertContact(chatsElem, 'Main', userName);
            }
        }
    }

    if (userName !== 'Main') {
        retrieveMessages();
    }

    retrieveContacts();


    /***********MESSAGES AND CONTACTS RETRIEVING END****************/


    /************** MESSAGES AND CONTACTS INSERTIONS START************/

    function insertMessage(parent, msg) {
        const message = document.createElement('p');
        message.setAttribute('class', "message");
        message.innerText = msg;
        parent.appendChild(message);
        parent.scrollTop = parent.scrollHeight;
    }

    function insertContact(parent, contactName, userName) {
        const contact = document.createElement('div');
        let lastMessage = "Now you have " + contactName + " in your contact list";
        let messages;
        if (contactName !== 'Main') {
            if (lsGetItem(contactName)) {
                messages = prsJSON(lsGetItem(contactName));
                lastMessage = messages[messages.length - 1];
            }
        } else {
            if (lsGetItem(userName)) {
                messages = prsJSON(lsGetItem(userName));
                lastMessage = messages[messages.length - 1];
            }
        }
        contact.setAttribute('class', 'contact');
        contact.setAttribute('data-contact', contactName);
        contact.innerHTML = '<h4>' + contactName + '</h4>' +
            '<p>' + lastMessage + '</p>';
        contact.addEventListener('click', () => {
            room = contactName;
            chatContent.classList.remove('none');
            chatsContent.classList.add('none');
            retrieveMessages();
            contactNameElem.innerText = room;
        });
        parent.appendChild(contact);
    }


    /************** MESSAGES AND CONTACTS INSERTIONS END************/

    /*********** ADDITIONAL FUNNCTIONs START******************/

    function handleMessageSend(event) {
        let msg = chatMsg.value;
        if ((event instanceof MouseEvent ||
            (event instanceof KeyboardEvent && event.keyCode === 13)) &&
            userName !== room && msg !== "") {
            socket.emit('message', room, userName, msg);
            msg = userName + " : " + msg;
            insertMessage(chatBox, msg);
            chatMsg.value = '';
        }
    }

    function prsJSON(value) {
        return JSON.parse(value);
    }

    function strJSON(value) {
        return JSON.stringify(value);
    }

    function lsGetItem(key) {
        return localStorage.getItem(key);
    }

    function lsSetItem(key, value) {
        localStorage.setItem(key, value);
    }


    /*********** ADDITIONAL FUNNCTIONs END******************/

})();