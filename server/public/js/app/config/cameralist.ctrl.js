define(['sentinel.app', 'config/config.service', 'config/camera.service', 'config/camera.ctrl', 'sockets/socket.service'], function(app) {
    'use strict';

    var injectParams = ['config', '$scope', '$localStorage', '$rootScope', '$http', '$routeParams', '$timeout', 'cameraFactory', 'socketService', 'configFactory', 'toaster'];

    var cameraCtrl = function(config, $scope, $localStorage, $rootScope, $http, $routeParams, $timeout, cameraFactory, socketService, configFactory, toaster) {

        var sockets;

        if ($localStorage.camStatusArray === void 0) {
            $localStorage.camStatusArray = {};
        }

        $scope.cameraStatus = {};

        load();

        function load() {

            cameraFactory.get({}, function(data, responseHeaders) {

                // store cameras for select            
                $scope.cameras = data.cameras;
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

        $scope.$on('camera:reload', function(){
            load();
        });
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

            console.log('update status', opt);

            $localStorage.camStatusArray[opt.cam] = opt.status;

            updateStatusLabel();

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

    }

    cameraCtrl.$inject = injectParams;

    app.register.controller('CameraListCtrl', cameraCtrl);

});