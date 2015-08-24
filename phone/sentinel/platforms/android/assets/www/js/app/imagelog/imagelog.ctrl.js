(function() {

    var injectParams = ['config', '$scope','$rootScope', '$location', '$http', '$routeParams', '$timeout', 'socketService'];

    var imagelogCtrl = function(config, $scope,$rootScope, $location, $http, $routeParams, $timeout, socketService) {

        if (typeof $routeParams.cam === 'undefined') {

            redirectTo('all');

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
            $location.path('/imagelog/' + id, false);
        }

    }

    imagelogCtrl.$inject = injectParams;

    sentinelApp.controller('ImagelogIndexCtrl', imagelogCtrl);

})();