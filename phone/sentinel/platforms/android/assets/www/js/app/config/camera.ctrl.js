(function() {

    var injectParams = ['config', '$scope', '$localStorage', '$rootScope', '$http', '$routeParams', '$timeout', 'cameraFactory', 'socketService', 'configFactory', 'toaster'];

    var cameraCtrl = function(config, $scope, $localStorage, $rootScope, $http, $routeParams, $timeout, cameraFactory, socketService, configFactory, toaster) {

        var sockets;

        if ($localStorage.camStatusArray === void 0) {
            $localStorage.camStatusArray = {};
        }

        init();

        function init() {

            cameraFactory.get({}, function(data, responseHeaders) {
                // store cameras for select
                $scope.cameras = [];
                $scope.cameras.push({
                    name: 'Mind'
                });
                Array.prototype.push.apply($scope.cameras, data.cameras);
                // first load  
                // querystring
                if (typeof $routeParams.cam !== 'undefined') {

                    if ($routeParams.cam === 'all') {

                        $scope.selectedCamera = $scope.cameras[0];

                    } else {

                        $scope.selectedCamera = getCameraByName($routeParams.cam);

                    }

                } else {

                    $scope.selectedCamera = $scope.cameras[0];

                }

                $localStorage.camera = $scope.selectedCamera;

                console.log('$scope.selectedCamera');
                console.log($scope.selectedCamera);

                // set statuses false if not declared before
                initCameraStatuses();
                // init socket and register events
                startSocketService();
                // set statuses to the scope from localstorage
                updateStatusLabel();
                // notify other controllers if cameras were loaded
                $rootScope.$broadcast('camera:load', data.cameras.map(function(el) {
                    return el.name;
                }));
            });
        }

        $scope.$on('camera:reload', function() {
            init();
        });
        /**
         * Set statues to the scope
         */
        function updateStatusLabel() {

            $scope.cameraStatus = $localStorage.camStatusArray[$scope.selectedCamera.name];

        }
        /**
         * Create socket connection and register events
         */
        function startSocketService() {

            sockets = initCameraSocketService(config, socketService);

            sockets.forEach(function(socket) {
                if (typeof socket !== 'undefined') {
                    socket.on('camera:status', updateCameraStatus);
                }
            });

        }
        /**
         * Refresh localstorage and gui
         * @param  opt.cam      camera name
         * @param  opt.status   whether camera is on/off
         */
        function updateCameraStatus(opt) {

            console.log('---------------------updateCameraStatus');

            $localStorage.camStatusArray[opt.cam] = opt.status;

            updateStatusLabel();

        }

        $scope.update = function() {

            $localStorage.camera = $scope.selectedCamera;

            $rootScope.$broadcast('camera:change', $scope.selectedCamera);

            console.log('update camera')
            console.log($scope.selectedCamera)

            startSocketService();
            updateStatusLabel();

        }

        $scope.updateCamera = function(camera) {

            cameraFactory.update({
                id: camera._id
            }, camera, function() {

                toaster.pop('info', 'Mentve!');

            }, function(res) {
                console.log(res);

                toaster.pop('error', 'Csatlakozási hiba!');

            });

        }
        /**
         * Create socket for all the cameras
         * @param  {Object} config          global config
         * @param  {SocketServiceProvider}  socketService for creating a socket
         * @return {Array}                  sockets
         */
        function initCameraSocketService(config, socketService) {
            var sockets = [];
            $scope.cameras.forEach(function(camera) {
                sockets.push(socketService.createSocket(config.socketUrl, config.sockets.camera, camera.name));
            });
            return sockets;
        }
        /**
         * Init statuses with false value for all the cameras
         */
        function initCameraStatuses() {
            $scope.cameras.forEach(function(camera) {

                if (typeof $localStorage.camStatusArray[camera.name] === 'undefined') {
                    $localStorage.camStatusArray[camera.name] = false;
                }

            });
        }

        function getCameraByName(name) {

            return $scope.cameras.filter(function(el) {
                return el.name === name;
            })[0];

        }
    }

    cameraCtrl.$inject = injectParams;

    sentinelApp.controller('CameraCtrl', cameraCtrl);

})();