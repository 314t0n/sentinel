(function() {

    var injectParam = ['$scope', '$rootScope', '$http', '$resource', '$localStorage', '$location', '$routeParams', '$timeout', 'notificationListService', 'Lightbox', 'toaster', 'notificationFactory', 'cfpLoadingBar', 'quickRepeatList', 'EventBinderService'];

    sentinelApp.directive('dragToDismiss', function($drag, $parse, $timeout) {
        return {
            restrict: 'A',
            compile: function(elem, attrs) {
                var dismissFn = $parse(attrs.dragToDismiss);
                return function(scope, elem) {
                    var dismiss = false;

                    $drag.bind(elem, {
                        transform: $drag.TRANSLATE_RIGHT,
                        move: function(drag) {
                            if (drag.distanceX >= drag.rect.width / 4) {
                                dismiss = true;
                                /*elem.addClass('dismiss');*/
                            } else {
                                dismiss = false;
                                elem.removeClass('dismiss');
                            }
                        },
                        cancel: function() {
                            elem.removeClass('dismiss');
                        },
                        end: function(drag) {
                            if (dismiss) {
                                /*elem.addClass('dismitted');*/
                                $timeout(function() {
                                    scope.$apply(function() {
                                        dismissFn(scope);
                                        drag.reset();
                                    });
                                }, 300);
                            } else {
                                drag.reset();
                            }
                        }
                    });
                };
            }
        };
    });

    var contentCtrl = function($scope, $rootScope, $http, $resource, $localStorage, $location, $routeParams, $timeout, notificationListService, Lightbox, toaster, notificationFactory, cfpLoadingBar, quickRepeatList, EventBinderService) {

        $scope.loading = true;

        $scope.itemsPerPage = notificationListService.config.limit
        $scope.currentPage = 1;
        $scope.totalItems = 0;

        $scope.filteredNotifications = [];

        notificationListService.update($scope, $routeParams);

        EventBinderService.setScope($scope);

        EventBinderService.add('camera:change', function(event, camera) {

            if (camera.name === 'Mind') {
                $routeParams.cam = 'all';
            } else {
                $routeParams.cam = camera.name;
            }

            notificationListService.update($scope, $routeParams);

            $scope.currentPage = 1;
            $scope.totalItems = 0;
            $rootScope.$broadcast('camera:update', camera.name);

        });

        EventBinderService.add('notification:change:all', function(event, args) {

            $scope.currentPage = 1;
            $scope.totalItems = $scope.itemsPerPage;
            notificationListService.update($scope, $routeParams);

        });

        EventBinderService.add('filter:notification', function(event, params) {

            notificationListService.update($scope, params);

        });

        EventBinderService.add('filter:notification:reset', function(event) {

            notificationListService.update($scope, {});

        });

        var updateLock = false;

        $scope.markNotification = function(notification) {
            // prevent call overflow by dragging
            if (updateLock) {
                return;
            }
            updateLock = true;
            // if already marked return
            if (!notification.isUnread) {
                return;
            }
            // important for gui update
            notification.isUnread = false;
            // send only the property to the server
            notificationFactory(app.baseUrl + 'api/v1/notification/:id').update({
                _id: notification._id,
                isUnread: false
            }, function() {
                toaster.pop('success', 'Értesítés megtekintve');
                updateLock = false;

            }, function() {
                toaster.pop('error', 'Szerver hiba!');
                updateLock = false;
            });
            // notify 
            $rootScope.$broadcast('notification:change', notification);

        }

        EventBinderService.add('scrolled', function(event, args) {
            cfpLoadingBar.start();
            $scope.currentPage++;
            $scope.totalItems += $scope.itemsPerPage;
            notificationListService.update($scope, $routeParams, true, function() {
                cfpLoadingBar.complete();
            });
        });

        $scope.openLightboxModal = function(index) {
            var images = notificationListService.getImageArray();
            Lightbox.openModal(images, index);
        };


        $scope.pageCount = function() {
            return $scope.totalItems;
        };

        $scope.pageChanged = function() {
            // unused
        };
        /*
          $scope.$watch('currentPage + itemsPerPage', function() {

            if ($routeParams.page) {
                $scope.currentPage = $routeParams.page;
            }

            $routeParams.id = $localStorage.camera;

            notificationListService.update($scope, $routeParams);       

        });*/

        EventBinderService.add('feed:notification', function(event, args) {

            notificationListService.update($scope, $routeParams);

        });

        EventBinderService.add('$destroy', function() {

            EventBinderService.removeAll();

        });

    }

    contentCtrl.$inject = injectParam;

    sentinelApp.controller('NotificationContentCtrl', contentCtrl);

})();