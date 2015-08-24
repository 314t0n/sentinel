(function() {

    var injectParams = ['config', '$scope', '$rootScope', '$routeParams', '$localStorage', '$http', '$anchorScroll', '$location', '$timeout', '$q', 'socketService', 'configFactory', 'toaster', '$modal', 'cameraFactory', 'cfpLoadingBar', 'EventBinderService'];

    var updateLock = false;

    var ngModels = ['camera.status', 'imagelog.status', 'imagelog.storeImage', 'motionDetect.status', 'motionDetect.storeImage'];
    /**
     * Index page
     * @param  {[type]} cameraSocketService [socket io service]
     * @param  {[type]} configFactory       [config loader, updater]
     */
    var configIndexCtrl = function(config, $scope, $rootScope, $routeParams, $localStorage, $http, $anchorScroll, $location, $timeout, $q, socketService, configFactory, toaster, $modal, cameraFactory, cfpLoadingBar, EventBinderService) {

        $scope.loading = true;

        if (typeof $routeParams.cam === 'undefined') {

            $scope.selectedCamera = 'all';
            redirectTo('all');

        } else {

            $scope.selectedCamera = $routeParams.cam;
            updateDOM();

        }

        EventBinderService.setScope($scope);

        EventBinderService.add('camera:change', function(event, msg) {
            // prevent watch events while updating 
            updateLock = true;
            $scope.loading = true;

            cfpLoadingBar.start();

            if (msg.name !== 'Mind') {

                $scope.selectedCamera = msg.name;

                updateDOM();

                redirectTo(msg.name);

            } else {

                redirectTo('all');

                $scope.selectedCamera = 'all';

                $rootScope.$broadcast('camera:hide');

                cfpLoadingBar.complete();

            }
            // prevent watch events
            $timeout(function() {
                updateLock = false;
                $scope.loading = false;
            }, 500);

        });

        function updateDOM() {

            updateConfig({
                id: $scope.selectedCamera
            }).then(function() {
                ngModels.forEach(function(el) {
                    registerConfigUpdate(el);
                });
            });
        }

        $scope.shutdown = function() {

            getCameraSocketService($scope.selectedCamera).emit('cam', {
                command: 'shutdown-service'
            });

            toaster.pop('warning', 'Kamera leáll!', 'A [' + $scope.selectedCamera + '] eszköz leállításra kerül.')

        }

        function getCameraSocketService(name) {
            return socketService.createSocket(config.socketUrl, config.sockets.camera, name);
        }

        function isNumeric(n) {
            return !isNaN(parseFloat(n)) && isFinite(n);
        }

        $scope.save = function(el, value, name, isNumber, min, max) {

            if (isNumber) {
                if (!isNumeric(value)) {
                    toaster.pop('warning', 'Hibás adat!', name);
                    return;
                }
            }

            if (typeof min !== 'undefined') {
                if (value < min) {
                    toaster.pop('warning', 'Hibás adat!', name);
                    return;
                }
            }

            if (typeof max !== 'undefined') {
                if (value > max) {
                    toaster.pop('warning', 'Hibás adat!', name);
                    return;
                }
            }

            saveHandler(el, value, name);

        }

        function saveHandler(el, value, name) {

            if (typeof value === 'undefined') {
                toaster.pop('warning', 'Hibás adat!', name);
                return;
            }

            saveConfig($scope, configFactory);

            var cameraSocketService = getCameraSocketService($scope.selectedCamera);

            cameraSocketService.emit('cam', {
                command: 'system-update',
                name: el,
                value: value
            });

            if (typeof value === 'boolean') {
                value = value ? 'Be' : 'Ki';
            }

            toaster.pop('info', 'Mentve', name + ": " + value);

        }

        /**
         * Emit updates on cameraSocket
         * @param  {[type]} $scope              [description]
         * @param  {[type]} configFactory       [description]
         * @param  {[type]} cameracameraSocketService [description]
         * @param  {[type]} el                  [current setting element]
         * @return {[type]}                     [unbindable]
         */
        function registerConfigUpdate(el) {

            var unbindConfigUpdate = $scope.$watch(el, function(newValue, oldValue) {

                if (updateLock) {
                    return;
                }

                if (isUndefined(oldValue)) {
                    return;
                }

                if (newValue === oldValue) {
                    return;
                }

                var names = {
                    'camera.status': 'Státusz',
                    'imagelog.status': 'Naplózás',
                    'imagelog.storeImage': 'Napló képek tárolása az eszközön',
                    'motionDetect.status': 'Mozgás érzékelés',
                    'motionDetect.storeImage': 'Mozgás érzékelés esetén képek tárolása az eszközön'
                };

                var name = names[el];

                saveHandler(el, newValue, name);

            });
        }
        /**
         * saveConfig via factory
         * @param  {[type]} $scope        [description]
         * @param  {[type]} configFactory [description]
         * @return {[type]}               [description]
         */
        function saveConfig($scope, configFactory) {

            var camera = $scope.camera;

            configFactory.update({
                id: camera._id
            }, camera);

        }
        /**
         * Loading config data
         * @param  {[type]} $q            [description]
         * @param  {[type]} $scope        [description]
         * @param  {[type]} configFactory [description]
         * @param  {[type]} params        [description]
         * @return {[type]}               [description]
         */
        function updateConfig(parameters) {

            return $q(function(resolve, reject) {

                $scope.loading = true;

                var params = parameters || {};

                configFactory.get(params,

                    function(data, responseHeaders) {

                        console.log('config')
                        console.log('config')
                        console.log('config')
                        console.log(data.config.camera)

                        if (data.config.camera === null || typeof data.config.camera === 'undefined') {

                            reject();

                        } else {

                            $scope.cameras = data.config.cameras;
                            $scope.camera = data.config.camera;
                            $scope.camera.$update = data.$update;
                            $scope.imagelog = data.config.camera.imagelog;
                            $scope.motionDetect = data.config.camera.motionDetect;

                            resolve();
                        }
                    });

            });

        }

        function redirectTo(id) {
            $location.path('/config/' + id, false);
        }

        EventBinderService.add('$destroy', function() {

            EventBinderService.removeAll();

        });

    }

    configIndexCtrl.$inject = injectParams;

    sentinelApp.controller('ConfigIndexCtrl', configIndexCtrl);

})();