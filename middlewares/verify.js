var jwt = require('jsonwebtoken');

module.exports = function () {
	return function(req, res, next){
		var token =  req.body.token;
		jwt.verify(token,'secret',function(err, decoded){
			if(err){
				res.send(401,{'error':'Session expired'});
			}
			else
			{
				res.send(200,{'session':'ok'});
			}
		});
	}
}