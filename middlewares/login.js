var crypto = require('./crypto.js');
var jwt = require('jsonwebtoken');
var queries = require('./queries.js');

module.exports = function(db,done) {
	return function(req, res, next){
		var user = req.body.username,
			password = req.body.password;
		var user = crypto.decrypt({username:user,password:password});
		  	db.query(queries.getUser(user.username,user.password),function(err, result){
		  		if(err){
		  			throw err;
		  		}
		  		if(result.rows[0].doc.first_name)
		  		{
		  			var user = result.rows[0];
		  			var token = jwt.sign(user, 'secret',{expiresInMinutes:60});
		  			res.json({token:token});
		  		}
		  		else
		  		{
		  			res.send(401, {message:'Wrong user or password'});
		  			return;
		  		}
		  	});
	}
}