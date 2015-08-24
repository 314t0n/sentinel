(function() {

    var injectParams = ['$scope', '$rootScope', '$location', '$routeParams', '$http', 'toaster', 'notificationListService'];

    var filterCtrl = function($scope, $rootScope, $location, $routeParams, $http, toaster, notificationListService) {

        $scope.data = {};

        $('#dLabel').dropdown('toggle');

        if (typeof $routeParams.from !== 'undefined' && typeof $routeParams.to !== 'undefined') {
            // init
            $scope.data.imagelogStartdate = new moment($routeParams.from).format('YYYY-MM-DD HH:mm:ss');
            $scope.data.imagelogEnddate = new moment($routeParams.to).format('YYYY-MM-DD HH:mm:ss');
        }
        if (typeof $routeParams.unread !== 'undefined') {
            // init
            $scope.data.unread = $routeParams.unread === 'true' ? true : false;
        }
        if (typeof $routeParams.cam !== 'undefined') {
            // init
            $scope.data.camera = $routeParams.cam !== 'all' ? $routeParams.cam : null;
        }

        $scope.startDateHidden = true;

        $scope.toggleStartDate = function() {
            $scope.startDateHidden = !$scope.startDateHidden;
        }

        $scope.onTimeSetStart = function() {
            $scope.startDateHidden = true;
        }

        $scope.endDateHidden = true;

        $scope.toggleEndDate = function() {
            $scope.endDateHidden = !$scope.endDateHidden;
        }

        $scope.onTimeSetEnd = function() {
            $scope.endDateHidden = true;
        }

        // submit action

        $scope.filterAction = function($event) {

            if (typeof $scope.data.imagelogEnddate === 'undefined' && typeof $scope.data.imagelogStartdate !== 'undefined') {

                toaster.pop('warning', 'Hibás dátum', 'Mindkét dátum mező kötelező!');
            }

            if (typeof $scope.data.imagelogEnddate !== 'undefined' && typeof $scope.data.imagelogStartdate === 'undefined') {

                toaster.pop('warning', 'Hibás dátum', 'Mindkét dátum mező kötelező!');
            }

            if (typeof $scope.data !== 'undefined') {

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

        }

        $scope.filterResetAction = function($event) {

            $scope.itemsPerPage = notificationListService.config.limit
            $scope.currentPage = 1;
            notificationListService.config.offset = 0;

            if (typeof $scope.data !== 'undefined') {

                $scope.data.imagelogStartdate = void 0;
                $scope.data.imagelogEnddate = void 0;

            }

            $rootScope.$broadcast('filter:notification:reset', {});

        }

    }

    filterCtrl.$inject = injectParams;

    sentinelApp.controller('NotificationFilterCtrl', filterCtrl);

})();