define(['sentinel.app', 'sockets/socket.service', 'imagelog/list.service', 'date.filter', 'pagination.service'], function(app) {
    'use strict';

    var injectParam = ['config', '$rootScope', '$scope', '$http', '$localStorage', '$location', '$routeParams', '$timeout', 'socketService', 'imagelogListService', 'Lightbox', 'PaginationService'];

    function initCameraSocketService(config, socketService) {
        return socketService.createSocket(config.socketUrl, config.sockets.camera);
    }

    var contentCtrl = function(config, $rootScope, $scope, $http, $localStorage, $location, $routeParams, $timeout, socketService, imagelogListService, Lightbox, PaginationService) {

        var firstLoad = true;
        setCurrentPage();
        /*$scope.currentPage = 1000;*/
        $scope.totalItems = 0;
        $scope.filteredImagelogs = [];
       
        $scope.itemsPerPage = 10;
        $scope.itemsPerPageNumber = 10;

        $scope.pageCount = function() {
            return $scope.totalItems;
        };

        $scope.pageChanged = function() {
            PaginationService.setCurrentPage($scope.currentPage);
        };

        $scope.$on('camera:change', function(event, camera) {

            if (camera.name === 'Mind') {
                $routeParams.cam = 'all';
            } else {
                $routeParams.cam = camera.name;
            }

            $rootScope.$broadcast('camera:update', camera);

            imagelogListService.update($scope, $routeParams);

        });

        $scope.$on('filter:imagelog', function(event, params) {
   
            imagelogListService.update($scope, params);

        });

        $scope.$on('filter:imagelog:reset', function(event) {

            imagelogListService.update($scope, {});

        });

        $scope.updateContent = function() {

            $scope.loading = true;

            console.log('updateContent');

            imagelogListService.config.limit = $scope.itemsPerPage;

            $scope.itemsPerPageNumber = $scope.itemsPerPage;

            $routeParams.id = $localStorage.camera.id;

            imagelogListService.update($scope, $routeParams);

        }

        $scope.$watch("currentPage", function(value) {
            console.log('watch', $scope.currentPage, value);
          
            /*   var searchObject = $location.search();       
            searchObject.page = $scope.currentPage;
            $location.search(searchObject);*/
        });

        $scope.$watch('currentPage + itemsPerPageNumber', function(newValue, oldValue) {

            imagelogListService.update($scope, $routeParams);

        });

        function setCurrentPage() {
            $scope.currentPage = PaginationService.getCurrentPage();
            console.log('setCurrentPage', $scope.currentPage)
        }

        $scope.openLightboxModal = function(index) {
            var images = imagelogListService.getImageArray();
            Lightbox.openModal(images, index);
        };

        $scope.$on('feed:imagelog', function(event, args) {

            imagelogListService.update($scope, $routeParams);

        });

    }

    contentCtrl.$inject = injectParam;

    app.register.controller('ImageLogContentCtrl', contentCtrl);

});