var url = require('url');
var jwt = require('jsonwebtoken');

module.exports = function () {
	return function(req, res, next){
		var url_parts = url.parse(req.url,true);
		var token = url_parts.query.token;

		jwt.verify(token,'secret',function(err, decoded){
			if(err){
				res.send(401,{'error':'Session expired'});
			}
			else	
			{
				res.send(200,decoded);
			}
		});
	}
}