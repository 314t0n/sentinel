(function() {
    'use strict';

    var injectParams = ['$scope', '$rootScope', '$routeParams', 'notificationFactory', 'SocketsService', 'toaster'];

    var notificationWidgetCtrl = function($scope, $rootScope, $routeParams, notificationFactory, SocketsService, toaster) {

        // init 

        var params = {
            unread: true,
            t: new Date().getTime() // disable caching
        };

        $scope.totalItems = 0;

        updateWidget();

        // events

        $scope.$on('socket:register', function(event) {

            var sockets = SocketsService.getMotionDetectSockets();

            for (var i = sockets.length - 1; i >= 0; i--) {

                var socket = sockets[i];

                socket.on('notification:add', function(msg) {
                    updateWidget();
                });

            };

        });

        $scope.$on('notification:change', function(msg) {
            updateWidget();
        });

        $scope.$on('feed:notification', function(msg) {
            updateWidget();
        });

        $scope.markAllAsRead = function() {

            notificationFactory(app.baseUrl + 'api/v1/notification/').markAsRead({

                markAsRead: 'all'

            }, function() {

                updateWidget();
                toaster.pop('success', 'Összes értesítés megjelölve olvasottként!');
                $rootScope.$broadcast('notification:change:all');

            });

        }

        // utils

        function updateWidget() {

            notificationFactory(app.baseUrl + 'api/v1/notification/count').query(params,

                function(data, responseHeaders) {

                    $scope.totalItems = data.count;

                });

        }

    }

    notificationWidgetCtrl.$inject = injectParams;

    sentinelApp.controller('NotificationWidgetCtrl', notificationWidgetCtrl);

})();