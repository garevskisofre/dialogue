function getUser (username, password) {
	return "select to_json(getuser('"+ username +"','"+ password +"')) as doc";  	
}

function createUser (user) {
	return "select to_json(createuser('"+ user.firstname +"','"+ user.lastname +"','"+ 
		user.username +"','"+ user.password +"','"+ user.gender +"')) as doc";  	
}

function checkNickname (nick) {
	return "select to_json(checkNickname('"+nick+"')) as doc";  	
}

exports.getUser = getUser;
exports.createUser = createUser;
exports.checkNickname = checkNickname;