 configModule.controller('ConfigPerformaceCtrl', ['$scope', '$rootScope', '$http', '$interval', 'cameraSocketService',
        function($scope, $rootScope, $http, $interval, cameraSocketService) {

            function getProgressBarType(value) {

                var type = null;

                if (value < 25) {
                    type = 'success';
                } else if (value < 50) {
                    type = 'info';
                } else if (value < 75) {
                    type = 'warning';
                } else {
                    type = 'danger';
                }

                return type;

            }

            $scope.memoryMax = 100;
            $scope.cpuMax = 100;
            $scope.memoryUsage = 0;
            $scope.memoryStatusType = null;
            $scope.cpuUsage = 0;
            $scope.cpuStatusType = null;

            $scope.progressBar = function() {

                var memoryValue = randomIntFromInterval(10, 100);
                var cpuValue = randomIntFromInterval(10, 100);

                /*$scope.showWarning = (type === 'danger' || type === 'warning');*/

                $scope.memoryUsage = memoryValue;
                $scope.memoryStatusType = getProgressBarType(memoryValue);

                $scope.cpuUsage = cpuValue;
                $scope.cpuStatusType = getProgressBarType(cpuValue);

            };


            /*$interval($scope.progressBar, 5000);*/


        }
    ]);