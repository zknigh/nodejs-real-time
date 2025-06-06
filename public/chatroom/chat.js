const socket = io('/chatroom');

let currentRoom = null;
//创造room
const roomInput = document.getElementById('roomInput')
const createRoom = document.getElementById('createRoom')
const joinRoom = document.getElementById('joinRoom')
//写消息
const input = document.getElementById('input');
const textarea = document.querySelector(".chat-input textarea");
const sendButton = document.getElementById('sendButton');
//消息
const messages = document.getElementById('Messages');
//发文件
const fileInput = document.getElementById('fileInput');
const sendFileBtn = document.getElementById('sendFileBtn');
//+按钮
const roomModal = document.getElementById('roomModal');
const openModalBtn = document.getElementById('openModalBtn');
const currentRoomLabel = document.getElementById('currentRoomLabel');
const hideroom = document.getElementById('hideroom');
///////js//////////////////////////////////////////////jsjsjsjsjsjs//

//按钮
openModalBtn.addEventListener('click', () => {
    roomModal.classList.remove('hidden');
});
currentRoomLabel.addEventListener('click', () => {
    hideroom.classList.remove('hidden');
});

// 关闭弹窗
roomModal.addEventListener('click', (e) => {
    if (e.target === roomModal) {
        roomModal.classList.add('hidden');
    }
});
hideroom.addEventListener('click', (e) => {
    if (e.target === hideroom) {
        hideroom.classList.add('hidden');
    }
});
//自动高度
textarea.addEventListener("input", function () {
    this.style.height = "auto";
    const newHeight = Math.min(this.scrollHeight, 180);
    this.style.height = this.scrollHeight + "px";
});
//sendbutton
sendButton.addEventListener('click',sendMessage);
input.addEventListener('keydown',function(e){
    if (e.key ==='Enter'){
        e.preventDefault();
        sendMessage();
    }
});



//////////////////////////////////////////////////ioioioioioioioioioiioioioioioioioioioio

joinRoom.addEventListener('click',() =>{
    const room = roomInput.value.trim();
    if (room) {
        socket.emit('joinRoom',room);
        currentRoom = room;
        messages.innerHTML = ''; // 清空聊天

        const roomLabel = document.getElementById('roomName');//聊天室状态
        if (roomLabel) {
            roomLabel.textContent = currentRoom;
        }
    }
});
//发送消息
function sendMessage(){
    if (input.value.trim() !== ''&&currentRoom){
        socket.emit('chat message',{room: currentRoom, message :input.value});
        input.value = '' ;
        input.style.height = "46px";
    }
}

//接受消息
socket.on('chat message',({ room, message }) => {
    if (room === currentRoom) {
        console.log('msg-success');
        const item = document.createElement('div');
        item.classList.add('message-item');
        item.textContent = message;
        messages.appendChild(item);
        messages.scrollTop = messages.scrollHeight;
    }
});
socket.on('chat history',(history) => {
    history.forEach(msg => {
        const item =document.createElement('div');
        item.classList.add('message-item'); // 加样式类
        item.textContent = msg;
        messages.appendChild(item);
    });
    messages.scrollTop = messages.scrollHeight;
});


//文件发送
sendFileBtn.addEventListener('click', () => {
    const file = fileInput.files[0];
    if (file && currentRoom) {
        const reader = new FileReader();
        reader.onload = function () {
            socket.emit('file message', {
                room: currentRoom,
                filename: file.name,
                filetype: file.type,
                data: reader.result // base64 编码
            });
        };
        reader.readAsDataURL(file); // 读为 Base64
    }
});
//文件接收
socket.on('file message', ({ room, filename, filetype, data }) => {
    if (room === currentRoom) {
        const item = document.createElement('div');
        item.classList.add('message-item');

        const link = document.createElement('a');
        link.href = data;
        link.download = filename;
        link.textContent = `📎 下载文件：${filename}`;
        link.target = "_blank";

        item.appendChild(link);
        messages.appendChild(item);
        messages.scrollTop = messages.scrollHeight;
    }
});