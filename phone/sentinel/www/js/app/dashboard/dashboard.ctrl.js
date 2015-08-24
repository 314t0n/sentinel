(function() {

    var injectParams = ['config', '$scope', '$rootScope', '$http', 'SocketsService', 'quickRepeatList', 'EventBinderService'];

    var dashboardController = function(config, $scope, $rootScope, $http, SocketsService, quickRepeatList, EventBinderService) {

        $scope.$on('socket:register', function(event) {

            registerEvents(SocketsService.getMotionDetectSockets(), registerMotionDetectSocketEvents);

            registerEvents(SocketsService.getCameraSockets(), registerCameraSocketEvents);

        });

        function registerEvents(sockets, eventHandler) {

            for (var i = sockets.length - 1; i >= 0; i--) {

                var socket = sockets[i];

                eventHandler(socket);

            };
        }

        function createSocketEventHandler(selector, broadcast) {

            return function(msg) {

                $rootScope.$broadcast(broadcast, msg);

                showSpinner(selector);

            }

        }

        function removeEventListeners(sockets, removeListener) {

            for (var i = sockets.length - 1; i >= 0; i--) {

                var socket = sockets[i];
                removeListener(socket);

            };
        }


        function showSpinner(selector, time) {

            var time = time || 900;

            angular(selector).addClass('fa-refresh fa-spin').delay(time).queue(function() {
                angular(this).removeClass('fa-spin').dequeue();
            });

        }

        var imagelogSocketEventHandler = createSocketEventHandler("#imagelog-marker", 'feed:imagelog');
        var notificationSocketEventHandler = createSocketEventHandler("#notification-marker", 'feed:notification');

        var removeNotifcationMarker = function() {
            $("#notification-marker").removeClass('fa-refresh fa-spin');
        };

        var removeImagelogMarker = function() {
            $("#imagelog-marker").removeClass('fa-refresh fa-spin');
        };

        // utils

        function registerCameraSocketEvents(socket) {

            socket.on('imagelog:add', imagelogSocketEventHandler);

            socket.on('disconnect', removeImagelogMarker);

        }

        function registerMotionDetectSocketEvents(socket) {

            socket.on('notification:add', notificationSocketEventHandler);

            socket.on('disconnect', removeNotifcationMarker);

        }

        $scope.$on('$destroy', function() {

            removeEventListeners(SocketsService.getMotionDetectSockets(), function(socket) {
                socket.removeListener('notification:add', notificationSocketEventHandler);
                socket.removeListener('disconnect', removeImagelogMarker);
            });
            removeEventListeners(SocketsService.getCameraSockets(), function(socket) {
                socket.removeListener('imagelog:add', imagelogSocketEventHandler);
                socket.removeListener('disconnect', removeImagelogMarker);
            });

        });

    };

    dashboardController.$inject = injectParams;

    sentinelApp.controller('DashboardCtrl', dashboardController);

})();