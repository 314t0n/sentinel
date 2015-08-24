define(['sentinel.app', 'config/camera.ctrl', 'sockets/socket.factory', 'notification/notification.factory', 'title.service'], function(app) {
    'use strict';

    var injectParams = ['$scope', '$rootScope', '$routeParams', 'notificationFactory', 'SocketFactory', 'TitleService'];

    var notificationWidgetCtrl = function($scope, $rootScope, $routeParams, notificationFactory, SocketFactory, TitleService) {

        // init 

        var params = {
            unread: true,
            t: new Date().getTime() // prvent caching
        };

        $scope.totalItems = 0;

        updateWidget();

        // events

        $scope.$on('socket:register', function(event) {

            var sockets = SocketFactory.getMotionDetectSockets();

            for (var i = sockets.length - 1; i >= 0; i--) {

                var socket = sockets[i];

                socket.on('notification:add', function(msg) {
                    updateWidget();
                });

            };

        });

        /*$scope.$on('$destroy', function(event) {
            socket.removeListener('notification:add');
        });*/

        $scope.$on('notification:change', function(msg) {
            updateWidget();
        });

        $scope.$on('feed:notification', function(msg) {
            updateWidget();
        });

        $scope.markAllAsRead = function() {

            notificationFactory('/api/v1/notification/').markAsRead({

                markAsRead: 'all'

            }, function() {

                updateWidget();
                $rootScope.$broadcast('notification:change:all');

            });

        }

        // utils

        function updateWidget() {

            notificationFactory('/api/v1/notification/count').query(params,

                function(data, responseHeaders) {

                    $scope.totalItems = data.count;

                    TitleService.setNotificationNumber(data.count);

                });

        }

    }

    notificationWidgetCtrl.$inject = injectParams;

    app.register.controller('NotificationWidgetCtrl', notificationWidgetCtrl);

});