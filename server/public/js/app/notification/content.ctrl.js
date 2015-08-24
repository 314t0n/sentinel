define(['sentinel.app', 'sockets/socket.service', 'notification/list.service', 'date.filter', 'pagination.service'], function(app) {
    'use strict';

    var injectParam = ['$scope', '$rootScope', '$http', '$resource', '$localStorage', '$location', '$routeParams', '$timeout', 'notificationListService', 'notificationFactory', 'toaster', 'Lightbox', 'PaginationService'];

    var contentCtrl = function($scope, $rootScope, $http, $resource, $localStorage, $location, $routeParams, $timeout, notificationListService, notificationFactory, toaster, Lightbox, PaginationService) {

        // init

        $scope.loading = true;
        setCurrentPage();

        $scope.itemsPerPage = notificationListService.config.limit
        $scope.currentPage = 1;
        $scope.totalItems = 0;

        $scope.filteredNotifications = [];

        // events

        $scope.markNotification = function(notification) {
            // if already marked return
            if (!notification.isUnread) {
                return;
            }
            // important for gui update
            notification.isUnread = false;
            // send only the property to the server
            notificationFactory('/api/v1/notification/:id').update({
                _id: notification._id,
                isUnread: false
            }, function() {
                toaster.pop('success', 'Értesítés megtekintve');
            }, function() {
                toaster.pop('error', 'Szerver hiba!');
            });
            // notify 
            $rootScope.$broadcast('notification:change', notification);

        }

        $scope.pageCount = function() {
            return $scope.totalItems;
        };

        $scope.pageChanged = function() {
            PaginationService.setCurrentPage($scope.currentPage);
        };

        $scope.openLightboxModal = function(index) {
            var images = notificationListService.getImageArray();
            Lightbox.openModal(images, index);
        };

        function setCurrentPage() {
            $scope.currentPage = PaginationService.getCurrentPage();
            console.log('setCurrentPage', $scope.currentPage)
        }

        $scope.$on('filter:notification', function(event, params) {

            notificationListService.update($scope, params);

        });

        $scope.$on('filter:notification:reset', function(event) {

            notificationListService.update($scope, {});

        });

        $scope.$on('camera:change', function(event, camera) {

            if (camera.name === 'Mind') {
                $routeParams.cam = 'all';
            } else {
                $routeParams.cam = camera.name;
            }

            $rootScope.$broadcast('camera:update', camera);

            notificationListService.update($scope, $routeParams);

        });

        $scope.$watch('currentPage + itemsPerPage', function() {

            if ($routeParams.page) {
                $scope.currentPage = $routeParams.page;
            }

            $routeParams.id = $localStorage.camera;

            notificationListService.update($scope, $routeParams);

        });

        $scope.$on('feed:notification', function(event, args) {

            notificationListService.update($scope, $routeParams);

        });

        $scope.$on('notification:change:all', function(event, args) {

            notificationListService.update($scope, $routeParams);

        });

        $scope.loading = false;

    }

    contentCtrl.$inject = injectParam;

    app.register.controller('NotificationContentCtrl', contentCtrl);

});