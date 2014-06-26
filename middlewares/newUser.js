var crypto = require('./crypto.js')
var url = require('url');
var jwt = require('jsonwebtoken');
var queries = require('./queries.js');
var schemas = require('./schemas.js');


module.exports = function(db) {
    return function(req, res, next) {

        var username = req.body.username,password = req.body.password,
            firstname = req.body.firstname,lastname = req.body.lastname,
            gender = req.body.gender;

        var user = crypto.decrypt({firstname: firstname,lastname: lastname,
            username: username,password: password,gender: gender
        });

        db.query(queries.createUser(user), function(err, result) {
            if(err){
                console.log('ERR QUERY:',err);
                res.send(501,{message:err});
            }

            console.log('NEW USER',result.rows[0].doc);

            if (result.rows[0].doc.first_name) {
                var user = result.rows[0];
                var token = jwt.sign(user, 'secret', {
                    expiresInMinutes: 60
                });
                res.json({token: token});
            }
            
        });
    }
}
