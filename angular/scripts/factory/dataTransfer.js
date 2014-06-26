app.factory('userData',function ($resource) {
	return $resource('/userData');
});

app.factory('getMessageHistory',function ($resource) {
	return $resource('/getMessageHistory');
});