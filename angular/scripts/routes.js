app.config(function ($routeProvider,$locationProvider,$httpProvider) {
	
    $routeProvider
		.when('/',{
			templateUrl:'templates/main.html',
			controller:'main',
			access : {allowAnonymous : true}
		})
		.when('/home',{
			templateUrl:'templates/home.html',
			controller:'main',
			access : {allowAnonymous : false}
		});

	$httpProvider.interceptors.push('authInterceptor');
});