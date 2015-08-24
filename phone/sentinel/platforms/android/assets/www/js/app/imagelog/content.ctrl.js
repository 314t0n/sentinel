(function() {

    var injectParam = ['config', '$scope', '$rootScope', '$http', '$localStorage', '$location', '$routeParams', '$timeout', 'socketService', 'imagelogListService', 'Lightbox'];


    var contentCtrl = function(config, $scope, $rootScope, $http, $localStorage, $location, $routeParams, $timeout, socketService, imagelogListService, Lightbox) {

        $scope.currentPage = 1;
        $scope.totalItems = 0;
        $scope.filteredImagelogs = [];
        $scope.itemsPerPage = imagelogListService.config.limit;

        imagelogListService.update($scope, $routeParams);

        $scope.$on('camera:change', function(event, msg) {

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

        $scope.$on('filter:imagelog', function(event, params) {
            console.log("szur")
            imagelogListService.update($scope, params);

        });

        $scope.$on('filter:imagelog:reset', function(event) {

            imagelogListService.update($scope, {});

        });

        $scope.pageCount = function() {
            return $scope.totalItems;
        };

        $scope.pageChanged = function() {
            // ..
        };

        $scope.$on('scrolled', function(event, args) {
            cfpLoadingBar.start();
            $scope.currentPage++;
            $scope.totalItems += $scope.itemsPerPage;
            imagelogListService.update($scope, $routeParams, true, function() {
                cfpLoadingBar.complete();
            });
        });

        /*$scope.openLightboxModal = function(index) {
            var images = imagelogListService.getImageArray();
            Lightbox.openModal(images, index);
        };*/

        $scope.$on('feed:imagelog', function(event, args) {

            imagelogListService.update($scope, $routeParams);

        });

    }

    contentCtrl.$inject = injectParam;

    sentinelApp.controller('ImageLogContentCtrl', contentCtrl);

})();