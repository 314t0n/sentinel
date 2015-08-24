(function() {

    var injectParams = ['$scope', '$rootScope', '$http', '$routeParams', '$timeout', '$location'];

    var notificationCtrl = function($scope, $rootScope, $http, $routeParams, $timeout, $location) {

        if (typeof $routeParams.cam === 'undefined') {

            redirectTo('all');

        }

        $scope.infinitePaging = function() {            
           $rootScope.$broadcast('scrolled', true);
        }

        $scope.$on('camera:change', function(event, msg) {

            var searchObject = $location.search();

            if (msg.name === 'Mind') {
                redirectTo('all');
            } else {
                redirectTo(msg.name);
                $rootScope.$broadcast('camera:update', msg.name);
            }

        });

        function redirectTo(id) {       
            $location.path('/notification/' + id, false);   
        }
    }

    notificationCtrl.$inject = injectParams;

    sentinelApp.controller('NotificationIndexCtrl', notificationCtrl);

})();