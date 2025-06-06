const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');

const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const port = 3000;
const roomMessages = {};

//mysql
const db = mysql.createConnection({
    host:'localhost',
    user:'readonly_user',
    password:'readpwd123',
    database:'user'
});
db.connect(err =>{
    if(err){
        console.error('失败',err);//?
    }else{
        console.log('mysql-OK');
    }
})




/////////////login login login/////////////////////////////////////////////////////////////////////////////////////////////

//连接
app.use(bodyParser.urlencoded({extended:true}));//app.use(bodyParser.json());
app.use(express.static('public'));

//see html
app.post ('/login',(req,res) => {
    const { username, password } = req.body;
console.log(`用户名: ${username}，密码: ${password}`);

  // 验证（仅用于演示）

const sql = `SELECT * FROM login WHERE username = ? AND password = SHA2(?, 256)`;
db.query(sql, [username, password], (err, results) => {
    if (err) {
console.error('查询错误：', err);
return res.status(500).send('服务器错误');
    }

    if (results.length > 0) {
res.send('登录成功！');
console.log('login-yes');
    } else {
res.send('用户名或密码错误');
console.group('login-no');
    }
})});
//////////////////////////////////////////////////ioioioioioioioioioiioioioioioioioioioio

const chatroom = io.of('/chatroom');//namespace

chatroom.on('connection',(socket) => {
    console.log('A user connect connected');
    //加入提醒



    socket.on('joinRoom',(room) =>{
        socket.join(room);
        console.log(`join: ${room}`);
        if (!roomMessages[room]){
            roomMessages[room] =[];
        }
        socket.emit('chat history',roomMessages[room]);
    });//房间加入创建///////

    socket.on('chat message',({room , message}) => {
        console.log(`${room},${message}`);
        if (roomMessages[room]){
            roomMessages[room].push(message);
        }else {
            roomMessages[room] = [message];
        }
        chatroom.to(room).emit('chat message',{ room, message});
    });//添加消息

    socket.on('file message', ({ room, filename, filetype, data }) => {
        chatroom.to(room).emit('file message', { room, filename, filetype, data });
    });//文件中转
    




    //离开提醒
    socket.on('disconnect',() =>{
        console.log('A user disconnected');
    });
});
//everylisten
http.listen(port, () => {
    console.log(`服务器已启动：http://localhost:${port}`);
});