define(['sentinel.app', 'sockets/socket.service'], function(app) {
    'use strict';

    var injectParams = ['config', '$rootScope', 'socketService'];

    var socketFactory = function(config, $rootScope, socketService) {

        var cameraSockets = [];
        var mdetectSockets = [];

        // event by camera ctrl

        $rootScope.$on('camera:load', function(event, cameras) {

            registerSockets(cameras);

            $rootScope.$broadcast('socket:register');

        });

        // utils

        function registerSockets(cameras) {

            cameraSockets.length = 0;
            mdetectSockets.length = 0;

            cameras.forEach(function(cameraName) {

                console.log('regi')

                if(cameraName === 'all'){
                    return;
                }

                var cameraSocket = initCameraSocketService(cameraName);
                var motionSocket = initMotionDetectSocketService(cameraName);                

                if (typeof cameraSocket !== 'undefined') {
                    cameraSockets.push(cameraSocket);
                }

                if (typeof motionSocket !== 'undefined') {
                    mdetectSockets.push(motionSocket);
                }

            });

        }

        function initCameraSocketService(cameraName) {
            return socketService.createSocket(config.socketUrl, config.sockets.camera, cameraName);
        }

        function initMotionDetectSocketService(cameraName) {
            return socketService.createSocket(config.socketUrl, config.sockets.mdetect, cameraName);
        }

        return {
            getCameraSockets: function() {
                return cameraSockets;
            },
            getMotionDetectSockets: function() {
                return mdetectSockets;
            },
            registerByCameras: function(cameras) {
                registerSockets(cameras);
            }
        }

    };

    socketFactory.$inject = injectParams;

    app.register.factory('SocketFactory', socketFactory);

});