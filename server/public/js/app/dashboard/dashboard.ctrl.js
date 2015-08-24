define(['sentinel.app', 'sockets/socket.factory', 'date.filter', 'notification/content.ctrl', 'notification/filter.ctrl', 'notification/widget.ctrl', 'imagelog/content.ctrl', 'imagelog/filter.ctrl', 'config/cameralist.ctrl'], function(app) {
    'use strict';

    var injectParams = ['config', '$scope', '$rootScope', '$http', 'SocketFactory'];

    var dashboardController = function(config, $scope, $rootScope, $http, SocketFactory) {

        // events

        $scope.$on('socket:register', function(event) {

            registerEvent(SocketFactory.getMotionDetectSockets(), registerMotionDetectSocketEvents);

            registerEvent(SocketFactory.getCameraSockets(), registerCameraSocketEvents);

        });

        function registerEvent(sockets, eventHandler) {

            for (var i = sockets.length - 1; i >= 0; i--) {

                var socket = sockets[i];

                eventHandler(socket);

            };
        }

        // utils

        function registerCameraSocketEvents(socket) {

            socket.on('imagelog:add', function(msg) {

                $rootScope.$broadcast('feed:imagelog', msg);

                $("#imagelog-marker").addClass('fa-refresh fa-spin').delay(900).queue(function() {
                    $(this).removeClass('fa-spin').dequeue();
                });

            });

            socket.on('disconnect', function() {
                $("#imagelog-marker").removeClass('fa-refresh fa-spin');
            });

        }

        function registerMotionDetectSocketEvents(socket) {

            socket.on('notification:add', function(msg) {           

                $rootScope.$broadcast('feed:notification', msg);

                $("#notification-marker").addClass('fa-refresh fa-spin').delay(600).queue(function() {
                    $(this).removeClass('fa-spin').dequeue();
                });

            });

            socket.on('disconnect', function() {
                $("#imagelog-marker").removeClass('fa-refresh fa-fw fa-spin');
            });

        }

    };

    dashboardController.$inject = injectParams;

    app.register.controller('DashboardCtrl', dashboardController);

});