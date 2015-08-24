(function() {

    console.log('authFactory');

    var injectParams = ['$http', '$rootScope', '$localStorage', 'userFactory'];

    var authFactory = function($http, $rootScope, $localStorage, userFactory) {

        var baseUrl = app.baseUrl;

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
                console.log('authenticate');
                if ($localStorage.token !== 'undefined') {
                    //no need to attach token, it's in the header
                    $http
                        .post(app.baseUrl + 'api/v1/auth/authenticate')
                        .success(function(res) {
                             console.log('authenticate success');
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
                //angular retard
               /* data['devices[]'] = data.devices || [];*/
                console.log(data);
                userFactory(app.baseUrl + 'api/v1/auth/me').update(data, success, error);                
            },
            login: function(data, success, error) {     
                console.log(app.baseUrl);       
                $http.post(app.baseUrl + 'api/v1/auth/login', data).success(function(res) {
                    if (res.status === 'success') {
                        var user = res.user;
                        user.isAuthenticated = true;
                        changeUser(user);
                    }
                    success(res);
                }).error(error);
            },
            me: function(success, error) {
                userFactory(app.baseUrl + 'api/v1/auth/me').query({}, success, error);               
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

    sentinelApp.factory('authService', authFactory);

})();