define(['sentinel.app', 'config/config.service'], function(app) {
    'use strict';

    var injectParams = ['configFactory'];

    var sizeChartService = function(configFactory) {

        var $scope = null;

        function init() {

            $scope.options = {
                thickness: 70,
                mode: "gauge",
                total: 100
            };

            $scope.data = [{
                label: "N/A",
                value: 0,
                color: "#d62728",
                suffix: "GB"
            }];

            $scope.totalSize = null;
            $scope.freeSize = null;
            $scope.usedSize = null;
            $scope.unit = 'GB';

        }

        function setEvents() {

            $scope.$on('camera:change', function(event, msg) {

                console.log('camera:change', msg);
                update(msg);

            }); 
            $scope.$on('sizechart:change', function(event, msg) {

                console.log('sizechart:change', msg);
                update(msg);

            });

            $scope.$on('camera:update', function(event, msg) {

                console.log('camera:update', msg);
                update(msg);

            });

            $scope.$on('camera:hide', function(event, msg) {

                console.log('camera:hide', msg);
                init();

            });

        }

        function roundGB(value) {
            return Math.round((value / 1024) * 100) / 100;
        }

        function update(camera) {        

            if (typeof camera === 'undefined') {              
                return;
            }

            if (camera.name === 'Mind' || camera.name === 'all') {
                init();
                return;
            }

            configFactory.get({
                    id: camera.name
                },

                function(data, responseHeaders) {

                    console.log('factory', data.config.camera.name);

                    var camera = data.config.camera;

                    if (typeof camera.size !== 'undefined') {

                        $scope.totalSize = roundGB(camera.size.total);
                        $scope.freeSize = roundGB(camera.size.free);
                        $scope.usedSize = roundGB(camera.size.total - camera.size.free);

                        $scope.options = {
                            thickness: camera.size.total * 0.7,
                            mode: "gauge",
                            total: camera.size.total
                        };

                        $scope.data = [{
                            label: camera.size.free,
                            value: camera.size.free,
                            color: "#d62728",
                            suffix: "GB"
                        }];

                    } else {

                        init();

                    }

                });

        }

        return {
            init: function(scope) {
                $scope = scope;
                init();
            },
            setEvents: function() {
                setEvents();
            },
            update: function(camera) {
                update(camera);
            }
        }
    };

    sizeChartService.$inject = injectParams;

    app.register.factory('SizeChartService', sizeChartService);

});