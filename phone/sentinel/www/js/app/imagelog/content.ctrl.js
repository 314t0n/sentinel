(function() {

    var injectParam = ['config', '$scope', '$rootScope', '$http', '$localStorage', '$location', '$routeParams', '$timeout', 'socketService', 'imagelogListService', 'Lightbox', 'EventBinderService'];


    var contentCtrl = function(config, $scope, $rootScope, $http, $localStorage, $location, $routeParams, $timeout, socketService, imagelogListService, Lightbox, EventBinderService) {

        $scope.currentPage = 1;
        $scope.totalItems = 0;
        $scope.filteredImagelogs = [];
        $scope.itemsPerPage = imagelogListService.config.limit;

        imagelogListService.update($scope, $routeParams);

        EventBinderService.setScope($scope);

        EventBinderService.add('camera:change', function(event, msg) {

            if (camera.name === 'Mind') {
                $routeParams.cam = 'all';
            } else {
                $routeParams.cam = camera.name;
            }

            imagelogListService.update($scope, $routeParams);

            $scope.currentPage = 1;
            $scope.totalItems = 0;
            $rootScope.$broadcast('camera:update', camera.name);

        });

        EventBinderService.add('filter:imagelog', function(event, params) {
            console.log("szur")
            imagelogListService.update($scope, params);

        });

        EventBinderService.add('filter:imagelog:reset', function(event) {

            imagelogListService.update($scope, {});

        });

        $scope.pageCount = function() {
            return $scope.totalItems;
        };

        $scope.pageChanged = function() {
            // ..
        };

        EventBinderService.add('scrolled', function(event, args) {
            cfpLoadingBar.start();
            $scope.currentPage++;
            $scope.totalItems += $scope.itemsPerPage;
            imagelogListService.update($scope, $routeParams, true, function() {
                cfpLoadingBar.complete();
            });
        });

        EventBinderService.add('feed:imagelog', function(event, args) {

            imagelogListService.update($scope, $routeParams);

        });

        EventBinderService.add('$destroy', function() {

            EventBinderService.removeAll();

        });

    }

    contentCtrl.$inject = injectParam;

    sentinelApp.controller('ImageLogContentCtrl', contentCtrl);

})();