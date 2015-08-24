define(['sentinel.app', 'dashboard/sizechart.service'], function(app) {
    'use strict';

    var injectParams = ['config', '$scope', '$rootScope', '$http', 'SizeChartService'];

    var sizeChartController = function(config, $scope, $rootScope, $http, SizeChartService) {

        SizeChartService.init($scope);
        SizeChartService.setEvents();

    };

    sizeChartController.$inject = injectParams;

    app.register.controller('SizeChartWidgetCtrl', sizeChartController);

});