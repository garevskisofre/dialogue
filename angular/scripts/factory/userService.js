app.factory('Auth',function ($http,$window,$location) {
	return {
		login : function(user){
			var encUser = CryptoJS.TripleDES.encrypt(user.username, "Fraza za user");
			var encPass = CryptoJS.TripleDES.encrypt(user.password, "Fraza za password");

			$http.post('/login',{username:encUser,password:encPass})
				.success(function(data){
					$window.sessionStorage.token = data.token;
					//$window.sessionStorage.username = user.username;
					//scope.socket = io.connect();
					$location.path("/home");
				})
				.error(function(data){
					alert('Message from server:\n'+data.message);
					delete $window.sessionStorage.token;
					console.log('Error',data.message);
				});
		},
		logOut : function () {
			delete $window.sessionStorage.token;
			
			$location.path('/');
		},
		createUser : function (user) {
			//console.log('CLIENT',user);
			var encFname = CryptoJS.TripleDES.encrypt(user.firstname, "Fraza za firstname");
			var encLname = CryptoJS.TripleDES.encrypt(user.lastname, "Fraza za lastname");
			var encUser = CryptoJS.TripleDES.encrypt(user.username, "Fraza za user");
			var encPass = CryptoJS.TripleDES.encrypt(user.password, "Fraza za password");
			var encGender = CryptoJS.TripleDES.encrypt(user.sex, "Fraza za gender");
			
			$http.post('/newUser',{firstname:encFname,lastname:encLname,username:encUser,password:encPass,gender:encGender})
				
				.success(function(data){
					//console.log('DATA',data);
					$window.sessionStorage.token = data.token;
					$location.path("/home");
				})
				.error(function(data){
					alert('Message from server:\n'+data.message);
					delete $window.sessionStorage.token;
					console.log('Error',data.message);
				})	
		},
		verify:function(){
			$http.post('/verify',{token:$window.sessionStorage.token}).error(function(response){
				delete $window.sessionStorage.token;
				$location.path('/');
			});
		}
	}
});