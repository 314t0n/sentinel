define(['sentinel.app'], function(app) {
    'use strict';

    var injectParams = ['$scope', '$rootScope', '$http', '$location', '$timeout', '$q', '$localStorage', 'authService', 'toaster']

    var loginController = function($scope, $rootScope, $http, $location, $timeout, $q, $localStorage, authService, toaster) {

        $scope.email = "user@test.com";
        $scope.password = "test";

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

                if (res === 'Unauthorized') {

                    toaster.pop('error', "Hiba", "Hibás felhasználónév vagy jelszó!");
                    $rootScope.statusMessage = 'Hiba';

                } else {

                    toaster.pop('error', "Hiba", "Nem sikerült csatlakozni a szerverhez!");
                    $rootScope.statusMessage = 'Hiba';
                }



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

        $scope.login = function() {

            if (checkFormData($scope)) {
                doLogin(formatData($scope));
            }

        };

        $scope.logout = function() {
            Auth.logout(function() {
                window.location = "/"
            }, function() {
                toaster.pop('error', "Failed to logout!");
            });
        };

        $scope.token = $localStorage.token;

    };

    loginController.$inject = injectParams;

    app.register.controller('LoginIndexCtrl', loginController);

});