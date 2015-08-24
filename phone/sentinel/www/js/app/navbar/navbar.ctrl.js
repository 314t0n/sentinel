(function() {

    var injectParams = ['$scope', '$location', '$timeout', 'cfpLoadingBar', 'authService'];

    var NavbarController = function($scope, $location, $timeout, cfpLoadingBar, authService) {

        //prevent forever loading bar
        $scope.$on('cfpLoadingBar:loading', function(e) {       
            $timeout(function() {                
                cfpLoadingBar.complete();
            }, 10000);
        });

        $scope.navigation = function(target) {

            $location.path(target);

        };

        $scope.isActive = function(viewLocation) {
       
            return viewLocation === $location.path();

        };

        $scope.isLoggedIn = function() {

            return authService.isLoggedIn();

        };

        $scope.logout = function() {

            authService.logout(function() {
                $location.path('/login');
            });

        };

    };

    NavbarController.$inject = injectParams;

    sentinelApp.controller('NavbarController', NavbarController);

})();