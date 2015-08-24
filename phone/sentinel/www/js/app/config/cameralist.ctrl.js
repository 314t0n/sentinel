(function() {

    var injectParams = ['config', '$scope', '$localStorage', '$rootScope', '$http', '$routeParams', '$timeout', 'cameraFactory', 'socketService', 'configFactory', 'toaster', 'BroadcastService', 'authService', 'quickRepeatList'];

    var cameraCtrl = function(config, $scope, $localStorage, $rootScope, $http, $routeParams, $timeout, cameraFactory, socketService, configFactory, toaster, BroadcastService, authService, quickRepeatList) {

        var socket;

        if ($localStorage.camStatusArray === void 0) {
            $localStorage.camStatusArray = {};
        }

        $scope.cameraStatus = {};

        /**
         * INIT
         */
        cameraFactory.get({}, function(data, responseHeaders) {
            // store cameras for select
            var cameras  = data.cameras || [];
            $scope.cameras = cameras;           
            // first load
            if (typeof $localStorage.camera !== 'undefined') {
                // get selected camera
                $scope.selectedCamera = cameras.filter(function(el) {
                    return el.name === $localStorage.camera.name;
                })[0];

            } else {
                // init with the first element
                $localStorage.camera = $scope.cameras[0];
                $scope.selectedCamera = $scope.cameras[0];

            }
            //whether to start IntentService for Notifications
            broadcastHandler(data.cameras);
            // set statuses false if not declared before
            initCameraStatuses();
            // init socket and register events
            startSocketService();
            // set statuses to the scope from localstorage
            updateStatusLabel();
            // notify other controllers if cameras were loaded
            $rootScope.$broadcast('camera:load', cameras.map(function(el) {
                return el.name;
            }));

        });

        function broadcastHandler(cameras) {

            authService.me(function(data) {

                var isNotificationAllowed = true;

                if (typeof data.devices !== 'undefined') {
                    if (typeof data.devices[uuid] !== 'undefined') {
                        isNotificationAllowed = data.devices[uuid] == 'true';
                    }
                }

                console.log('isNotificationAllowed');
                console.log(isNotificationAllowed);

                if (isNotificationAllowed) {
                    BroadcastService.start(cameras);
                }

            });
        }

        /**
         * Set statues to the scope
         */
        function updateStatusLabel() {
            //[$scope.selectedCamera.name]
            $scope.cameraStatus = $localStorage.camStatusArray;
        }
        /**
         * Create socket connection and register events
         */
        function startSocketService() {

            sockets = initCameraSocketService(config, socketService);

            sockets.forEach(function(socket) {

                socket.on('camera:status', updateCameraStatus);

            });

        }
        /**
         * Refresh localstorage and gui
         * @param  opt.cam      camera name
         * @param  opt.status   whether camera is on/off
         */
        function updateCameraStatus(opt) {

            console.log('update status');

            $localStorage.camStatusArray[opt.cam] = opt.status;

            updateStatusLabel();

        }

        $scope.checkSelectedCamera = function(cam) {
            if ($scope.selectedCamera)
                return $scope.selectedCamera.name === cam.name;
            else
                return true;
        }

        $scope.updateCamera = function(camera, settingName) {

            var emit = function(el, newValue) {
                var cameraSocketService = getCameraSocketService(camera.name);
                cameraSocketService.emit('cam', {
                    command: 'system-update',
                    name: el,
                    value: newValue
                });
            };

            cameraFactory.update({
                id: camera._id
            }, camera, function() {

                if (settingName === 'md') {
                    emit('motionDetect.status', camera.motionDetect.status);
                } else if (settingName === 'log') {
                    emit('imagelog.status', camera.imagelog.status);
                }

                toaster.pop('success', 'Mentve!');

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

        function getCameraSocketService(name) {
            return socketService.createSocket(config.socketUrl, config.sockets.camera, name);
        }

    }

    cameraCtrl.$inject = injectParams;

    sentinelApp.controller('CameraListCtrl', cameraCtrl);

})();