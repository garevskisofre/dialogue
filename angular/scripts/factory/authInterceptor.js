app.factory('authInterceptor',function ($rootScope, $q, $window) {
	return {
		request: function(config){
			config.headers = config.headers || {};
			if($window.sessionStorage.token)
			{
				config.headers.Authorization = 'Bearer ' + $window.sessionStorage.token;
			}
			return config;
		},
		response:function(res){
			console.log('res',res);
			return res || $q.when(res);
		}
	}
});
