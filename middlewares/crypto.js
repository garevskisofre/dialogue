var crypto = require('./cryptolib.js');

function decrypt(user){
		if(user.firstname)
			var decrFname = crypto.CryptoJS.TripleDES.decrypt(user.firstname, "Fraza za firstname");
		if(user.lastname)
			var decrLname = crypto.CryptoJS.TripleDES.decrypt(user.lastname, "Fraza za lastname");
		if(user.gender)
			var decrGender = crypto.CryptoJS.TripleDES.decrypt(user.gender, "Fraza za gender");

		var decrUser = crypto.CryptoJS.TripleDES.decrypt(user.username, "Fraza za user");
		var decrPass = crypto.CryptoJS.TripleDES.decrypt(user.password, "Fraza za password");
		
		if(user.firstname)
			var firstname = decrFname.toString(crypto.CryptoJS.enc.Utf8);
		if(user.lastname)
			var lastname = decrLname.toString(crypto.CryptoJS.enc.Utf8);
		if(user.gender)
			var gender = decrGender.toString(crypto.CryptoJS.enc.Utf8);
		
		var user = decrUser.toString(crypto.CryptoJS.enc.Utf8);
		var pass = decrPass.toString(crypto.CryptoJS.enc.Utf8);

		return {firstname:firstname||null, lastname:lastname||null,gender:gender||null,
		 username:user, password:pass}
}

exports.decrypt = decrypt;