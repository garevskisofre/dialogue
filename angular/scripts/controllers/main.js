var app = angular.module('app', ['ngRoute', 'ngResource', 'ngSanitize']);

app.controller('main', function($scope,Auth,userData,$window,$http){
    window.scope = $scope;
	$scope.uniqueUsername = false;
    $scope.chatHistory = {};
    $scope.selectedUser = null;
	
    $scope.checkFields = function(user) {
        if (user) {
            var firstname = /[a-zA-Z]/g.exec(user.firstname || '');
            var lastname = /[a-zA-Z]/g.exec(user.lastname || '');
            var username = /[a-zA-Z0-9]/g.exec(user.username || '');
            var gender = user.sex;
            //console.log("PASS:",user.password,"PASS2",user.password2);
            if (gender)
                gender == 'true' ? true : false;
            return (username && firstname && $scope.uniqueUsername && lastname && gender && user.password != undefined && user.password2 != undefined && user.password2 != "" && user.password2 != "" && (user.password === user.password2)) || false;
        }
        return false;
    };

    $scope.checkNickname = function(username) {
        $http.post('/checkNickname', {
            nickname: username
        }).success(function(res) {
            $scope.uniqueUsername = true;
        }).error(function(data) {
            $scope.uniqueUsername = false;
            alert(data.message);
        });
    }

	$scope.login = function(user) {
        Auth.login(user);
    }

    $scope.logOut = function() {
        Auth.logOut();
    }

    $scope.createUser = function(user) {
        Auth.createUser(user);
    }

    if ($window.sessionStorage.token) {
        userData.get({
            token: $window.sessionStorage.token
        }, function(data) {
            $scope.user = data.doc;

            $scope.socket = io.connect('https://localhost',{secure:true,port:3000});
            //$scope.socket.socket.reconnect();

            $scope.socket.on('connect', function() {
                console.log("user", $scope.user);
                //pri prvo vklucuvanje na userot se slucuva ovoj nastan
                $scope.socket.emit('set user', {
                    user: $scope.user
                });

                //dokolku istiot user se vkluci dvapati se slucuva ovoj nastan
                $scope.socket.on('current user', function(data) {
                    $scope.user.friends = data.users;
                    data.users.forEach(function(user) {
                        if (!$scope.chatHistory[user.username]) {
                            $scope.chatHistory[user.username] = {};
                        }
                    });
                    if (!$scope.$$phase)
                        $scope.$apply();
                });

                //koga ke se vkluci nov user im kazuva na drugite
                $scope.socket.on('new user', function(data) {
                    $scope.user.friends = data.users;
                    console.log('NEW', data);

                    if (!$scope.chatHistory[data.newuser]) {
                        $scope.chatHistory[data.newuser] = {};
                    }

                    if (!$scope.$$phase)
                        $scope.$apply();
                });


                $scope.sendMessage = function() {
                    if ($scope.selectedUser) {
                        $scope.socket.emit('new message', {
                            'user': $scope.user,
                            'message': $scope.message,
                            'to': $scope.selectedUser,
                            'date': Date.now()
                        });
                        if (!$scope.chatHistory[$scope.selectedUser.username].messages)
                            $scope.chatHistory[$scope.selectedUser.username].messages = [];
                        $scope.chatHistory[$scope.selectedUser.username].messages.push({
                            'user': $scope.user,
                            'message': $scope.message,
                            'to': $scope.selectedUser,
                            'date': Date.now()
                        });

                        $scope.message = "";
                        /*$scope.selectedUser.chatHistory.push({'from':$scope.user,
                            'message':$scope.message,'to':$scope.selectedUser});*/
                    } else {
                        alert("Please select user");
                    }
                }

                $scope.socket.on('new message', function(data) {
                    console.log('DATA', data);
                    if (!$scope.chatHistory[data.user.username]) {
                        $scope.chatHistory[data.user.username] = {};
                    }
                    if (!$scope.selectedUser || $scope.selectedUser.username != data.user.username)
                        $scope.chatHistory[data.user.username].seen = true;
                    if (!$scope.chatHistory[data.user.username].messages){
                            $http.post('/getMessageHistory', {
                                idSender: data.user.id_user,
                                idReceiver: data.to.id_user
                            }).success(function(dataSrv) {
                                $scope.chatHistory[data.user.username].messages = 
                                    dataSrv.data.map(function(elem, index) {
                                        var result = {
                                            "id_user":elem.idReceiver == data.to.id_user ? 
                                        data.to.id_user : data.user.id_user,
                                            "message": elem.message,
                                            "date": elem.date,
                                            "user": {
                                                "first_name": elem.idSender == data.to.id_user ? 
                                                    data.to.first_name : data.user.first_name,
                                                "last_name": elem.idSender == data.to.id_user ? 
                                                    data.to.last_name : data.user.last_name,
                                                "imageurl": elem.idSender == data.to.id_user ? 
                                                    data.to.imageurl : data.user.imageurl
                                            }
                                        };

                                        return result;
                                    });
                            });
                    }
                    else{

                        $scope.chatHistory[data.user.username].messages.push(data);
                    }
                    

                    if (!$scope.$$phase)
                        $scope.$apply();
                });

                $scope.socket.on('disconnect user', function(data) {
                    delete $scope.chatHistory[data.username];
                    $scope.user.friends.splice($scope.user.friends.indexOf(data.username), 1);
                    if (!$scope.$$phase)
                        $scope.$apply();
                });

            });
        });
    }

    $scope.selectUser = function(user) {
        $scope.selectedUser = user;

        if (!$scope.chatHistory[$scope.selectedUser.username].messages) {
            $http.post('/getMessageHistory', {
                idSender: $scope.user.id_user,
                idReceiver: $scope.selectedUser.id_user
            }).success(function(data) {
                console.log('HISTORYY', data);
                $scope.chatHistory[$scope.selectedUser.username].messages = 
                    data.data.map(function(elem, index) {
                        var result = {
                            "id_user":elem.idReceiver == $scope.selectedUser.id_user ? 
                                    $scope.selectedUser.id_user : $scope.user.id_user,
                            "message": elem.message,
                            "date": elem.date,
                            "user": {
                                "first_name": elem.idSender == $scope.selectedUser.id_user ? 
                                    $scope.selectedUser.first_name : $scope.user.first_name,
                                "last_name": elem.idSender == $scope.selectedUser.id_user ? 
                                    $scope.selectedUser.last_name : $scope.user.last_name,
                                "imageurl": elem.idSender == $scope.selectedUser.id_user ? 
                                    $scope.selectedUser.imageurl : $scope.user.imageurl
                            }
                        };

                        return result;
                });
            });
        }
        $scope.chatHistory[$scope.selectedUser.username].seen = false;
    }

    $scope.$on('$routeChangeStart', function(e, next, current) {
        if (next.access != undefined && !next.access.allowAnonymous 
            && !$window.sessionStorage.token) {
            $location.path('/');
        } else if (next.access != undefined && !next.access.allowAnonymous 
            && $window.sessionStorage.token) {
            Auth.verify();
        } else if (next.access != undefined && next.access.allowAnonymous 
            && $window.sessionStorage.token) {
            if ($route.current)
                $location.path($route.current.$$route.originalPath);
        }
    });

});