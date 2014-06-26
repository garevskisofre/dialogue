module.exports = function(msgModel) {

    return function(req, res, next) {

        var idSender = req.body.idSender;
        var idReceiver = req.body.idReceiver;

        console.log('ID_SENDER:', idSender);
        console.log('ID_RECEIVER:', idReceiver);

        msgModel.find({$or:[{"idSender":idSender,"idReceiver":idReceiver},{"idSender":idReceiver,"idReceiver":idSender}]},{"_id":false},function (err,data) {
			if(err)
			{
				console.log('ERR',err);
			}
			console.log('DATA',data);
			res.json(200,{"data":data});
		});
    }
}
