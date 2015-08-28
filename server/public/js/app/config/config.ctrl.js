define(['sentinel.app', 'sockets/socket.service', 'config/config.service', 'config/camera.service', 'config/camera.ctrl', 'config/cameralist.ctrl'], function(app) {
    'use strict';

    var injectParams = ['config', '$scope', '$rootScope', '$routeParams', '$localStorage', '$http', '$anchorScroll', '$location', '$timeout', '$q', 'socketService', 'configFactory', 'toaster', '$modal', 'cameraFactory', 'cfpLoadingBar'];
    // prevent watch event while changing camera
    var updateLock = false;
    // models watched for change
    var ngModels = ['camera.status', 'imagelog.status', 'imagelog.storeImage', 'motionDetect.status', 'motionDetect.storeImage'];

    /**
     * Index page
     * @param  {[type]} cameraSocketService [socket io service]
     * @param  {[type]} configFactory       [config loader, updater]
     */
    var configIndexCtrl = function(config, $scope, $rootScope, $routeParams, $localStorage, $http, $anchorScroll, $location, $timeout, $q, socketService, configFactory, toaster, $modal, cameraFactory, cfpLoadingBar) {

        $scope.loading = true;

        if (typeof $routeParams.cam === 'undefined') {

            $scope.selectedCamera = 'all';
            redirectTo('all');

        } else {

            $scope.selectedCamera = $routeParams.cam;

            if ($scope.selectedCamera !== 'all') {
                updateDOM();
            }

        }

        /* var params = initCameraID($localStorage);*/

        $scope.$on('camera:change', function(event, msg) {
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
            updateConfig($q, $scope, configFactory, {
                id: $scope.selectedCamera
            }).then(function() {
                ngModels.forEach(function(el) {
                    registerConfigUpdate($scope, configFactory, el, toaster, $timeout);
                });
            });
        }

        $scope.scrollTo = function(id) {
            $location.hash(id);
            $anchorScroll();
        }

        $scope.shutdown = function() {

            getCameraSocketService($scope.selectedCamera).emit('cam', {
                command: 'shutdown-service'
            });

            toaster.pop('warning', 'Kamera leáll!', 'A [' + $scope.selectedCamera + '] eszköz leállításra kerül.')

        }
        /**
         * Create new camera configuration
         * @param {[type]} $scope         Config scope
         * @param {[type]} $modalInstance Modal form
         */
        function addCameraCtrl($scope, $modalInstance) {

            $scope.ok = function() {

                //check id

                var isUniqeId = true;

                if (typeof $scope.name === 'undefined') {
                    toaster.pop('error', 'Hibás adatok', 'Az összes mező kötelező!');
                    return;
                }
                //@TODO separete name and id
                var name = $scope.name;
                var id = $scope.name;

                cameraFactory.get({}, function(data, responseHeaders) {

                    isUniqeId = data.cameras.filter(function(el) {
                        return el.name === name;
                    }).length === 0;

                    if (isUniqeId) {

                        $modalInstance.close({
                            name: name,
                            id: id
                        });

                    } else {

                        toaster.pop('error', 'Hibás azonosító', 'A megadott azonosító már foglalt: ' + name + "!");

                    }

                });

            };

            $scope.cancel = function() {
                $modalInstance.dismiss('cancel');
            };
        }

        function addCamera(data) {
            cameraFactory.save(data, function() {
                toaster.pop('success', 'Mentve', data.name + ": " + data.id);
                $rootScope.$broadcast('camera:reload');
            });
        }

        $scope.addCameraModal = function(size) {

            var modalInstance = $modal.open({
                templateUrl: 'addCameraModal.html',
                controller: addCameraCtrl,
                size: size
            });

            modalInstance.result.then(addCamera);

        }

        function deleteCameraCtrl($scope, $modalInstance) {

            $scope.ok = function() {

                $modalInstance.close();

            };

            $scope.cancel = function() {
                $modalInstance.dismiss('cancel');
            };
        }

        $scope.deleteCameraModal = function(size) {

            var modalInstance = $modal.open({
                templateUrl: 'deleteCameraModal.html',
                controller: deleteCameraCtrl,
                size: size
            });

            modalInstance.result.then(function(data) {
                console.log($scope.camera._id);
                $scope.camera.isDeleted = true;
                cameraFactory.delete({
                    id: $scope.camera._id
                }, {}, function() {

                    toaster.pop('warning', 'Törölve', $scope.camera.name);

                    redirectTo('all');
                    $scope.selectedCamera = 'all';
                    $rootScope.$broadcast('camera:reload');

                }, function() {
                    toaster.pop('error', 'Szerver hiba!');
                });

            });

        }

        function redirectTo(id) {
            $location.path('/config/' + id, false);
        }

        function getCameraSocketService(name) {
            return socketService.createSocket(config.socketUrl, config.sockets.camera, name);
        }

        function initCameraID($localStorage) {
            if ($localStorage.camera) {
                var params = {};
                params['id'] = $localStorage.camera.id;
                return params;
            }
            return {};
        }

        $scope.save = function(el, value, name) {

            saveHandler(el, value, name);

        }

        function saveHandler(el, value, name) {

            if (typeof value === 'undefined') {
                toaster.pop('warning', 'Hibás adat!', name );
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
        function registerConfigUpdate($scope, configFactory, el, toaster, $timeout) {

            var unbindConfigUpdate = $scope.$watch(el, function(newValue, oldValue) {

                if (updateLock) {
                    return;
                }

                if (typeof oldValue === 'undefined') {
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
        function updateConfig($q, $scope, configFactory, parameters) {

            return $q(function(resolve, reject) {

                $scope.loading = true;

                var params = parameters || {};

                configFactory.get(params,

                    function(data, responseHeaders) {

                        console.log('data', data);

                        $scope.camera = data.config.camera;
                        $scope.camera.$update = data.$update;
                        $scope.imagelog = data.config.camera.imagelog;
                        $scope.motionDetect = data.config.camera.motionDetect;

                        cfpLoadingBar.complete();
                        resolve();

                        $rootScope.$broadcast('camera:update', data.config.camera);

                    }, function(){
                        console.log('datvót hibaa', data);

                        redirectTo('all');
                    });

            });

        }

        //for testing
        function randomIntFromInterval(min, max) {

            return Math.floor(Math.random() * (max - min + 1) + min);

        }

    }

    configIndexCtrl.$inject = injectParams;

    app.register.controller('ConfigIndexCtrl', configIndexCtrl);

});