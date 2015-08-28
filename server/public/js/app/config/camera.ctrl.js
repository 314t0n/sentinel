define(['sentinel.app', 'config/config.service', 'config/camera.service', 'config/camera.ctrl', 'sockets/socket.service', 'dashboard/sizechart.widget', 'notification/widget.ctrl'], function(app) {
    'use strict';

    var injectParams = ['config', '$scope', '$localStorage', '$rootScope', '$http', '$routeParams', '$timeout', 'cameraFactory', 'socketService', 'configFactory'];

    var cameraCtrl = function(config, $scope, $localStorage, $rootScope, $http, $routeParams, $timeout, cameraFactory, socketService, configFactory) {

        // init 

        var sockets;

        if ($localStorage.camStatusArray === void 0) {
            $localStorage.camStatusArray = {};
        }

        $scope.cameraStatus = "N/A";
        $scope.totalSize = "N/A";
        $scope.freeSize = "N/A";
        $scope.usedSize = "N/A";

        init();

        // utils      

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
                        $localStorage.camera = $scope.selectedCamera;

                    }

                } else {

                    $scope.selectedCamera = $scope.cameras[0];
                    $localStorage.camera = $scope.cameras[0];
                }       

                // set statuses false if not declared before
                initCameraStatuses();
                // init socket and register events
                startSocketService();
                // set statuses to the scope from localstorage
                updateStatusLabel();
                // notify observers
            
                /*$rootScope.$broadcast('camera:change', $scope.selectedCamera);  */    

                $rootScope.$broadcast('sizechart:change', $scope.selectedCamera);                
                $rootScope.$broadcast('camera:load', data.cameras.map(function(el) {
                    return el.name;
                }));

            });

        }

        $scope.$on('camera:reload', function() {
            init();
        });

        function updateStatusLabel() {

            if (typeof $scope.selectedCamera !== 'undefined') {
                $scope.cameraStatus = $localStorage.camStatusArray[$scope.selectedCamera.name];
            }

        }
        /**
         * Socket connection with the selected camera
         */
        function startSocketService() {

            sockets = initCameraSocketService(config, socketService);

            sockets.forEach(function(socket) {

                socket.on('camera:status', updateCameraStatus);

                socket.on('disconnect', disconnectHandler);

                socket.on('camera:freespace', updateSizeChart);

            });

        }

        function updateSizeChart(msg) {
            console.log('update chart')
            if ($scope.selectedCamera.name === msg.name) {
                $rootScope.$broadcast('camera:update', msg);
            }
        }

        function disconnectHandler(msg) {
            console.log('disconnect', msg);
        }
        /**
         * Refresh localstorage and gui
         * @param  opt.cam      camera name
         * @param  opt.status   whether camera is on/off
         */
        function updateCameraStatus(opt) {

            $localStorage.camStatusArray[opt.cam] = opt.status;

            updateStatusLabel();

        }

        $scope.update = function() {

            $localStorage.camera = $scope.selectedCamera;

            $rootScope.$broadcast('camera:change', $scope.selectedCamera);

            startSocketService();
            updateStatusLabel();

        }

        function getCameraByName(name) {

            return $scope.cameras.filter(function(el) {
                return el.name === name;
            })[0];

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

                console.log(camera.name);
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

    app.register.controller('CameraCtrl', cameraCtrl);

});