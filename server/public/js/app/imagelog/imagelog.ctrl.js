define(['sentinel.app', 'sockets/socket.service', 'date.filter', 'imagelog/content.ctrl', 'imagelog/filter.ctrl', 'config/camera.ctrl', 'pagination.service'], function(app) {
    'use strict';

    var injectParams = ['config', '$rootScope', '$scope', '$http', '$routeParams', '$timeout', 'socketService', '$location', 'PaginationService'];

    var imagelogCtrl = function(config, $rootScope,$scope, $http, $routeParams, $timeout, socketService, $location, PaginationService) {

        if (typeof $routeParams.cam === 'undefined') {

            redirectTo('all');

        }

        $scope.$on('camera:change', function(event, msg) {

            var searchObject = $location.search();

            if (msg.name === 'Mind') {
                redirectTo('all');
            } else {
                redirectTo(msg.name);
                $rootScope.$broadcast('camera:update', msg.name);
            }

        });

        function redirectTo(id) {
            $location.path('/imagelog/' + id, false);
        }

    }

    imagelogCtrl.$inject = injectParams;

    app.register.controller('ImagelogIndexCtrl', imagelogCtrl);

});