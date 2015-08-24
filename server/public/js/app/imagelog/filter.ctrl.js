define(['sentinel.app', 'imagelog/list.service', 'pagination.service'], function(app) {
    'use strict';

    var injectParams = ['$scope', '$rootScope', '$location', '$routeParams', '$http', 'imagelogListService', 'toaster', 'PaginationService'];

    var filterCtrl = function($scope, $rootScope, $location, $routeParams, $http, imagelogListService, toaster, PaginationService) {

        $scope.data = {};

        if (typeof $routeParams.from !== 'undefined' && typeof $routeParams.to !== 'undefined') {
            // init
            $scope.data.imagelogStartdate = new moment($routeParams.from).format('YYYY-MM-DD HH:mm:ss');
            $scope.data.imagelogEnddate = new moment($routeParams.to).format('YYYY-MM-DD HH:mm:ss');
        }

        if (typeof $routeParams.cam !== 'undefined') {
            // init
            $scope.data.camera = $routeParams.cam !== 'all' ? $routeParams.cam : null;
        } else {

            $scope.data.camera = 'all';

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
                        'to': $scope.data.imagelogEnddate
                        /* 'page': PaginationService.getCurrentPage()*/
                    });

                }

            }

            $rootScope.$broadcast('filter:imagelog', {
                'from': $scope.data.imagelogStartdate,
                'to': $scope.data.imagelogEnddate,
                'cam': $scope.data.camera
            });

        }

        $scope.filterResetAction = function($event) {

            $scope.itemsPerPage = imagelogListService.config.limit
            $scope.currentPage = 1;
            imagelogListService.config.offset = 0;

            if (typeof $scope.data !== 'undefined') {

                $scope.data.imagelogStartdate = void 0;
                $scope.data.imagelogEnddate = void 0;

            }

            $location.search({
                'from': null,
                'to': null,
                'page': null
            });

            $rootScope.$broadcast('filter:imagelog:reset');

        }

    }

    filterCtrl.$inject = injectParams;

    app.register.controller('ImagelogFilterCtrl', filterCtrl);

});