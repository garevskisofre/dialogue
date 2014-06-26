var express = require('express'),
	fs = require('fs'),
	pg = require('pg'),
	connect = require('connect'),
	https = require('https'),
    login = require('./middlewares/login.js'),
    checkNickname = require('./middlewares/checkNickname.js'),
    newUser = require('./middlewares/newUser.js'),
    verify = require('./middlewares/verify.js'),
    userData = require('./middlewares/userData.js'),
    socket = require('socket.io'),
    mongoose = require('mongoose'),
    schemas = require('./middlewares/schemas.js'),
    getMessageHistory = require('./middlewares/getMessageHistory.js');

var app = express();

var options = {
	key:fs.readFileSync('server.key'),
	cert:fs.readFileSync('server.crt')
}

var optionsMongo = {
  server:{
      ssl: true,
      sslKey:fs.readFileSync('client.key'),
      sslCert:fs.readFileSync('client.crt')
  },
  user:'sofre',
  password:'garevski',
  auth:true
};

mongoose.connect('mongodb://localhost/dialogue',optionsMongo,function(err){
  if(err)
    return console.log('ERROR',err);
  console.log('CONNECTED TO MONGO');
});

var dbMongo = mongoose.connection;
var connStr = "localhost://sofre:garevski@localhost/dialogue?ssl=true";

pg.defaults.poolSize = 100;

pg.connect(connStr, function(err, client, done) {
    if (err)
      return console.log("ERROR",err);
    console.log('CONNECTED TO POSTGRES');
    //login user
    app.post('/login', login(client));
    //check new user
    app.post('/checkNickname', checkNickname(client));
    //add new User
    app.post('/newUser', newUser(client));
});

app.use('/', express.static(__dirname + '/angular'));
app.set('env', 'production');
app.use(connect.bodyParser());

//verify user
app.post('/verify', verify());
//get UserData
app.get('/userData', userData());

var server = https.createServer(options,app).listen(3000,function () {
	console.log('Server listens on port 3000');
});

var io = socket.listen(server);
var storedSockets = {};

var getUsers = function(socket) {
    var users = [];
    var keys = Object.keys(storedSockets).filter(function(key) {
        return key != socket.user.username;
    });

    keys.forEach(function(key) {
        users.push(storedSockets[key].user);
    });
    //console.log('USERS',users);
    return users;
};

dbMongo.once('open', function() {
    var messageModel = schemas.messageModel;
    var message = null;
    
    app.post('/getMessageHistory',getMessageHistory(messageModel));

    io.sockets.on('connection',function(socket){
        
            socket.on('set user', function(data, callback) {
                console.log('SET USER',data);
                if (!storedSockets[data.user.username]) {
                    socket.user = data.user;
                    //var nickname = data.user.username;
                    socket.emit('current user', {
                        'username': socket.user.username,
                        'users': getUsers(socket)
                    });

                    storedSockets[socket.user.username] = socket;

                    var users = Object.keys(storedSockets).filter(function(key) {
                        return key != socket.user.username;
                    });

                    users.forEach(function(user) {
                        storedSockets[user].emit('new user', {
                            'currentuser': user,
                            'newuser': socket.user.username,
                            'users': getUsers(storedSockets[user])
                        });
                    });

                } else {
                    socket.user = data.user;
                    socket.emit('current user', {
                        'username': socket.user.username,
                        'users': getUsers(socket)
                    });
                }
            });
            
            socket.on('new message', function(data) {
                message = new messageModel(
                  {
                    'idSender':data.user.id_user,
                    'idReceiver':data.to.id_user,
                    'message':data.message,
                    'date':data.date
                  });

                message.save(function(err,msg){
                  if(err)
                    console.log('ERR SAVE:',err);

                  storedSockets[data.to.username].emit('new message', data);
                });
            });

            socket.on('disconnect', function() {
                delete storedSockets[socket.user.username];
                socket.broadcast.emit('disconnect user', {
                    username: socket.user.username
                });
            });

    });
});