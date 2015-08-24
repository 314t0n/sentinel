(function() {

    var injectParams = ['config', '$scope', '$rootScope', '$http', 'socketService', '$localStorage', '$timeout', '$routeParams', 'cfpLoadingBar', '$location', 'toaster', '$window', '$document', 'EventBinderService'];

    var streamCtrl = function(config, $scope, $rootScope, $http, socketService, $localStorage, $timeout, $routeParams, cfpLoadingBar, $location, toaster, $window, $document, EventBinderService) {

        $scope.loading = true;

        if (typeof $routeParams.cam === 'undefined') {

            $scope.selectedCamera = 'all';
            redirectTo('all');

        } else {

            $scope.selectedCamera = $routeParams.cam;
            $timeout(updateDOM, 1000);
        }

        EventBinderService.setScope($scope);

        EventBinderService.add('camera:change', function(event, msg) {

            $scope.loading = true;

            cfpLoadingBar.start();

            if (msg.name !== 'Mind') {

                $scope.selectedCamera = msg.name;

                $timeout(updateDOM, 1000);

                redirectTo(msg.name);

                cfpLoadingBar.complete();

            } else {

                redirectTo('all');

                $scope.selectedCamera = 'all';

                $rootScope.$broadcast('camera:hide');

                cfpLoadingBar.complete();

            }

        });

        function redirectTo(id) {
            $location.path('livestream/' + id, false);
        }

        function updateDOM() {

            var receiver = document.querySelector('#camera-stream');

            if (receiver === null) {
                return;
            }

            if ($localStorage.camera.resolution) {

                $scope.resX = $localStorage.camera.resolution.x;
                $scope.resY = $localStorage.camera.resolution.y;

                $scope.resX = $scope.resX > 960 ? 960 : $scope.resX;
                $scope.resY = $scope.resY > 720 ? 720 : $scope.resY;

            } else {

                $scope.resX = 320;
                $scope.resX = 240;

            }

            var settings = {
                canvasWidth: $scope.resX,
                canvasHeight: $scope.resY
            };

            function getCameraSocketService(name) {
                return socketService.createSocket(config.socketUrl, config.sockets.camera, name);
            }

            function getStreamSocketService(name) {
                return socketService.createSocket(config.socketUrl, config.sockets.stream, name);
            }

            var streamSocket = getStreamSocketService($scope.selectedCamera);
            var cameraSocket = getCameraSocketService($scope.selectedCamera);
            $scope.settings = settings;


            var receiverContext = receiver.getContext('2d');
            var receiverDataLength = settings.canvasWidth * settings.canvasHeight * 4;
            var receiverPos = 0;
            var statusFlag = document.querySelector('#camera-status');
            var statusText = document.querySelector('#camera-status-text');
            var streamBtnIcon = document.querySelector('#stream-ctrl');

            var buffer = [];
            var minBufferSize = 0;
            var maxBufferSize = 10;

            var fpsNumber = 10.0;
            var timeOut = 1000.0 / fpsNumber;

            var isStreamingOn = false;
            $scope.isStreamingOn = false;

            resetCanvas();

            function updateCanvasBinary(data) {

                var bb = new Blob(data, {
                    type: 'image/jpg'
                });
                var url = URL.createObjectURL(bb);
                var img = new Image;

                img.onload = function() {
                    receiverContext.drawImage(this, 0, 0);
                    URL.revokeObjectURL(url);
                }

                img.src = url;

            }

            function updateCanvas(data) {

                if (typeof data === 'undefined') {
                    return;
                }

                var img = new Image();
                img.onload = function() {
                    receiverContext.drawImage(this, 0, 0, settings.canvasWidth, settings.canvasHeight);
                }
                img.src = "data:image/jpg;base64," + data;

            }

            function resetCanvas() {
                console.log('reset')
                receiverContext.fillStyle = "#000";
                receiverContext.fillRect(0, 0, settings.canvasWidth, settings.canvasHeight);
                $scope.fpsText = '-';
            }

            function streamer() {
                $timeout(function() {
                    if (isStreamingOn) {
                        /*updateCanvasBinary(buffer.shift());*/
                        var frame = buffer.shift();
                        updateCanvas(frame);
                        streamer();

                    }
                }, timeOut);
            }

            //events
            //
            var fpsCounter = 0;
            var isFirst = true;
            var chunks = [];
            var isStreamStarted = false;

            function chunksToImage(chunks) {
                var image = '';
                while (chunks.length > 0) {
                    image += chunks.shift();
                }
                return image;
            }

            var syncStream = function() {

                $timeout(function() {
                    if (isStreamingOn) {
                        updateCanvas(buffer.shift());
                        syncStream();
                    }
                }, timeOut);

            }

            streamSocket.on('stream', function(msg) {

                buffer.push(msg);

                fpsCounter++;
                if (isFirst && buffer.length > 10) {
                    /* debugFPS();*/
                    isFirst = false;
                    syncStream();
                    $scope.$broadcast('timer-start');
                }

            });

            function stopStream() {

                console.log('STOP STREAM');
                console.log('STOP STREAM');
                console.log('STOP STREAM');

                isStreamingOn = false;
                isStreamStarted = false;

                resetCanvas();

                $scope.$broadcast('timer-reset');

                sendStreamRequest();

            }

            streamSocket.on('stream:disconnect', function(msg) {
                stopStream();
            });

            streamSocket.on('disconnect', function(msg) {
                stopStream();
            });

            cameraSocket.on('camera:status', function(msg) {
                if (msg.status === false && isStreamingOn) {
                    stopStream();
                }
            });

            EventBinderService.add("$destroy", function() {
                if (isStreamingOn) {
                    stopStream();
                }
                document.addEventListener("pause", stopStream, false);
                document.addEventListener("backbutton", stopStream, false);
                /*    angular.element($document).bind("pause", stopStream);
                angular.element($document).bind("backbutton", stopStream);*/
            });

            EventBinderService.add('$locationChangeStart', function(event) {
                if (isStreamingOn) {
                    stopStream();
                }
            });

            angular.element($window).bind("beforeunload", stopStream);

            angular.element($document).bind("pause", stopStream);

            angular.element($document).bind("backbutton", stopStream);

            cameraSocket.on('sysmsg:stream', function(msg) {

                if (msg === 'camera:offline') {

                    isStreamingOn = false;
                    isStreamStarted = false;

                    return;

                }

            });

            function stopStream() {

                console.log('- STOP STREAM -');

                isStreamingOn = false;

                isStreamingOn = false;
                isStreamStarted = false;

                resetCanvas();

                $scope.$broadcast('timer-reset');

            }

            function setStreamingFlags() {
                isStreamingOn = !isStreamingOn;
                $scope.isStreamingOn = isStreamingOn;

                if (isFirst === false) {
                    isFirst = true;
                }
            }

            function resetBuffer() {
                buffer.length = 0;
                chunks.length = 0;
            }

            function setTimer() {
                if (!isStreamingOn) {
                    $scope.$broadcast('timer-reset');
                }
            }

            function sendStreamRequest() {
                var command = isStreamingOn ? 'start-stream' : 'stop-stream';
                //todo !!!
                streamSocket.emit(command);

                cameraSocket.emit('cam', {
                    'command': command,
                    'id': $scope.selectedCamera
                });
            }

            function isDeviceOnline() {
                return $localStorage.camStatusArray[$scope.selectedCamera];
            }

            $scope.streamSwitch = function() {

                if (!isDeviceOnline()) {
                    toaster.pop('warning', 'Az eszköz offline!');
                    return;
                }

                resetCanvas();
                resetBuffer();
                setStreamingFlags();
                setTimer();
                sendStreamRequest();

            }

        }

        EventBinderService.add('$destroy', function() {

            EventBinderService.removeAll();

        });

    }

    streamCtrl.$inject = injectParams;

    sentinelApp.controller('StreamIndexCtrl', streamCtrl);

})();