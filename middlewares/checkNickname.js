var queries = require('./queries.js');

module.exports = function(db,done) {
	return function(req, res, next){

		var nickname = req.body.nickname;
		  	db.query(queries.checkNickname(nickname),function(err, result){
		  		if(err){
		  			return console.error('Error from Query:', err);
		  		}
		  		
		  		if(result.rows[0].doc.username)
		  		{
		  			res.send(409,{message:"Duplicate username"});
		  			return;
		  		}
		  		else
		  		{
		  			res.send(200,{message:"Unique username"});
		  		}
		  		
		  	});
	}
}