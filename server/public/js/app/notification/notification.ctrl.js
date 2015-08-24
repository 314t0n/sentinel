define(['sentinel.app', 'config/camera.ctrl', 'sockets/socket.service', 'date.filter', 'notification/content.ctrl', 'notification/filter.ctrl'], function(app) {
    'use strict';

    var injectParams = ['$scope', '$rootScope', '$http', '$routeParams', '$timeout', '$location'];

    var notificationCtrl = function($scope, $rootScope, $http, $routeParams, $timeout, $location) {

        if (typeof $routeParams.cam === 'undefined') {

            redirectTo('all');

        }

        $scope.$on('camera:change', function(event, msg) {

            var searchObject = $location.search();

            if (msg.name === 'Mind') {
                redirectTo('all');
            } else {
                redirectTo(msg.name);
                $rootScope.$broadcast('camera:update', msg);
            }



            /*$location.search(searchObject);*/

        });

        function redirectTo(id) {
            $location.path('/notification/' + id, false);
        }

    }

    notificationCtrl.$inject = injectParams;

    app.register.controller('NotificationIndexCtrl', notificationCtrl);

});