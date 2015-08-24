define(['sentinel.app', 'notification/list.service'], function(app) {
    'use strict';

    var injectParams = ['$scope', '$rootScope', '$location', '$routeParams', '$http', 'notificationListService', 'toaster', '$localStorage'];

    var filterCtrl = function($scope, $rootScope, $location, $routeParams, $http, notificationListService, toaster, $localStorage) {

        $scope.data = {};

        if (typeof $routeParams.from !== 'undefined' && typeof $routeParams.to !== 'undefined') {
            // init
            $scope.data.imagelogStartdate = new moment($routeParams.from).format('YYYY-MM-DD HH:mm:ss');;
            $scope.data.imagelogEnddate = new moment($routeParams.to).format('YYYY-MM-DD HH:mm:ss');;
        }

        if (typeof $routeParams.unread !== 'undefined') {
            // init
            $scope.data.unread = $routeParams.unread === 'true' ? true : false;
        }

        if (typeof $routeParams.cam !== 'undefined') {
            // init
            $scope.data.camera = $routeParams.cam !== 'all' ? $routeParams.cam : null;
        }

        // submit action

        $scope.filterAction = function($event) {

            if (typeof $scope.data !== 'undefined') {

                if (typeof $scope.data.imagelogEnddate === 'undefined' && typeof $scope.data.imagelogStartdate !== 'undefined') {

                    toaster.pop('warning', 'Hibás dátum', 'Mindkét dátum mező kötelező!');
                }

                if (typeof $scope.data.imagelogEnddate !== 'undefined' && typeof $scope.data.imagelogStartdate === 'undefined') {

                    toaster.pop('warning', 'Hibás dátum', 'Mindkét dátum mező kötelező!');
                }

                if ($scope.data.imagelogEnddate < $scope.data.imagelogStartdate) {

                    toaster.pop('warning', 'Hibás dátum', 'A kezdő érték nagyobb mint a záró érték.');

                } else {

                    $location.search({
                        'from': $scope.data.imagelogStartdate,
                        'to': $scope.data.imagelogEnddate,
                        'unread': $scope.data.unread ? 'true' : null
                    });

                }

            }

            $rootScope.$broadcast('filter:notification', {
                'from': $scope.data.imagelogStartdate,
                'to': $scope.data.imagelogEnddate,
                'cam': $scope.data.camera,
                'unread': $scope.data.unread ? 'true' : null
            });


            /* notificationListService.update($scope, $routeParams);*/

        }

        $scope.filterResetAction = function($event) {

            $scope.itemsPerPage = notificationListService.config.limit
            $scope.currentPage = 1;
            notificationListService.config.offset = 0;

            if (typeof $scope.data !== 'undefined') {

                $scope.data.imagelogStartdate = void 0;
                $scope.data.imagelogEnddate = void 0;
                $scope.data.unread = false;

            }

            $location.search({
                'from': null,
                'to': null,
                'page': null,
                'unread': null
            });

            $rootScope.$broadcast('filter:notification:reset', {});

            /*notificationListService.update($scope, {});*/

        }

    }

    filterCtrl.$inject = injectParams;

    app.register.controller('NotificationFilterCtrl', filterCtrl);

});