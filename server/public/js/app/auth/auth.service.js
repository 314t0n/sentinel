define(['sentinel.app'], function(app) {
    'use strict';

    var injectParams = ['$http', '$rootScope', '$localStorage'];

    var authFactory = function($http, $rootScope, $localStorage) {

        var baseUrl = config.baseUrl;

        function changeUser(user) {

            angular.extend(currentUser, user);

        }

        function urlBase64Decode(str) {
            var output = str.replace('-', '+').replace('_', '/');
            switch (output.length % 4) {
                case 0:
                    break;
                case 2:
                    output += '==';
                    break;
                case 3:
                    output += '=';
                    break;
                default:
                    throw 'Illegal base64url string!';
            }
            return window.atob(output);
        }

        var currentUser = {
            isAuthenticated: false
        };

        return {
            authenticate: function(success, error) {
                if ($localStorage.token !== 'undefined') {
                    //no need to attach token, it's in the header
                    $http
                        .post(baseUrl + 'api/v1/auth/authenticate')
                        .success(function(res) {
                            currentUser.isAuthenticated = true;
                            success();
                        })
                        .error(error);
                }
            },
            isLoggedIn: function() {
                return currentUser.isAuthenticated;
            },
            save: function(data, success, error) {
                return $http.post(baseUrl + '/signin', data).success(success).error(error)
            },
            login: function(data, success, error) {
                $http.post(baseUrl + 'api/v1/auth/login', data).success(function(res) {
                    if (res.status === 'success') {
                        var user = res.user;
                        user.isAuthenticated = true;
                        changeUser(user);
                    }
                    success(res);
                }).error(error);
            },
            me: function(success, error) {
                $http.get(baseUrl + '/me').success(success).error(error)
            },
            logout: function(success) {
                changeUser({
                    isAuthenticated: false
                });
                delete $localStorage.token;
                success();
            },
            redirectToLogin: function() {
                $rootScope.$broadcast('redirectToLogin', null);
            }
        };
    }

    authFactory.$inject = injectParams;

    app.factory('authService', authFactory);

});