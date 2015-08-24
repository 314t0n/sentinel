define(['sentinel.app'], function(app) {
    'use strict';

    var injectParams = ['$scope', '$location', 'authService'];

    var NavbarController = function($scope, $location, authService) {

        $scope.isActive = function(viewLocation) {    
                
            return ~$location.path().indexOf(viewLocation);

        };

        $scope.isLoggedIn = function() {

            return authService.isLoggedIn();

        };

        $scope.logout = function() {

            authService.logout(function(){
                $location.path('/login');
            });            

        };

    };

    NavbarController.$inject = injectParams;

    app.controller('NavbarController', NavbarController);

});