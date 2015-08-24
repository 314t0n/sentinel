(function() {

    var injectParams = ['$scope', '$rootScope', '$location', '$routeParams', '$http', 'toaster', 'imagelogListService'];

    var filterCtrl = function($scope, $rootScope, $location, $routeParams, $http, toaster, imagelogListService) {

        $scope.data = {};

        $('#dLabel').dropdown('toggle');

        if (typeof $routeParams.from !== 'undefined' && typeof $routeParams.to !== 'undefined') {
            // init
            $scope.data.imagelogStartdate = new moment($routeParams.from).format('YYYY-MM-DD HH:mm:ss');
            $scope.data.imagelogEnddate = new moment($routeParams.to).format('YYYY-MM-DD HH:mm:ss');
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

            $rootScope.$broadcast('filter:imagelog:reset', {});

        }

    }

    filterCtrl.$inject = injectParams;

    sentinelApp.controller('ImagelogFilterCtrl', filterCtrl);

})();