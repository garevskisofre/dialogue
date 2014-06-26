var mongoose = require('mongoose');

var messageSchema = mongoose.Schema({
	idSender: Number,
	idReceiver:Number,
	message: String,
	date: { type: Date, default: Date.now }
});

var usersSchema = mongoose.Schema({
	id_user: Number,
	username: String,
    first_name: String,
    last_name: String,
    sex: Boolean,
    imageurl: String
});




var message = mongoose.model('message',messageSchema);
var usersModel = mongoose.model('user',usersSchema);

exports.messageSchema = messageSchema;
exports.messageModel = message;

exports.usersSchema = usersSchema;
exports.usersModel = usersModel;