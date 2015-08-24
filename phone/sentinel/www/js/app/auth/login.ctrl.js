(function() {

    console.log('login kulso');

    var injectParams = ['$scope', '$rootScope', '$http', '$location', '$timeout', '$q', '$localStorage', 'authService', 'toaster']

    var loginController = function($scope, $rootScope, $http, $location, $timeout, $q, $localStorage, authService, toaster) {

        $scope.email = "hajnaldavid@elte.hu";
        $scope.password = "314_@Ultron";

        $scope.dev = true;

        $scope.toggle = function() {         
            $scope.dev = $scope.dev === true ? false : true;
        }

        function checkFormData(scope) {
            if (scope.email === null || scope.password === null) {
                toaster.pop('warning', "Hiba", "Kérem töltse ki a mezőket!");
                return false;
            }
            return true;
        }

        function formatData($scope) {
            return {
                email: $scope.email,
                password: $scope.password
            };
        }

        function doLogin(formData) {

            authService.login(formData, function(res) {

                if (res.status !== 'success') {

                    toaster.pop('error', "Hiba", "");

                } else {

                    loginSuccess(res);

                }

            }, function(res) {

                toaster.pop('error', "Hiba", "Nem sikerült csatlakozni a szerverhez!");

                $rootScope.statusMessage = 'Hiba';

                console.log(app.baseUrl);

            });

        }

        function loginSuccess(res) {

            var path = '/dashboard';

            $localStorage.token = res.token;

            toaster.pop('success', "Sikeres bejelentkezés", "Továbbirányítás a vezérlőpultra");

            $scope.loading = true;

            $timeout(function() {
                $location.path(path);
            }, 200);

        }

        $scope.customIp = void 0;
        $scope.customPort = void 0;

        $scope.login = function() {

            if (typeof $scope.customIp !== 'undefined') {
                app.baseUrl = "http://" + $scope.customIp;
            }

            if (typeof $scope.customIp !== 'undefined') {
                app.baseUrl += ":" + $scope.customPort + "/";
            }

            if (checkFormData($scope)) {
                doLogin(formatData($scope));
            }

        };

        $scope.logout = function() {
            Auth.logout(function() {
                window.location = "/"
            }, function() {
                alert("Failed to logout!");
            });
        };

        $scope.token = $localStorage.token;

    };

    loginController.$inject = injectParams;

    sentinelApp.controller('LoginIndexCtrl', loginController);

})();