(function() {
    'use strict';

    var injectParams = ['$rootScope', '$localStorage'];

    var socketService = function($rootScope, $localStorage) {

        var sockets = {};
        /**
         * Creates new socketService for angular
         * @param  {String} socketUrl Connection url
         * @param  {String} clientID  Socket Namespace
         * @param  {String} cameraID  Camera id
         * @return {SocketService}
         */
        function createSocketService(socketUrl, clientID, cameraID) {

            var id = cameraID;

            var socket = io.connect(socketUrl + clientID, {
               /* 'origins': '*:*',*/
                forceNew: true,
                transports: ['polling'],
                query: {
                    'phone': true,
                    'id': id,
                    'token': $localStorage.token
                }
            });

            socket.on('error', function(err) {
                console.error(err);
            });

            return socketServiceFactory(socket, $rootScope);

        }
        /**
         * Adds socket if not created before
         * @param {String} socketUrl Connection url
         * @param {String} clientID  Socket Namespace
         * @param {Socket} camID     Camera id
         */
        function addSocket(socketUrl, clientID, camID) {
            if (!sockets.hasOwnProperty(getHash(clientID, camID))) {
                console.log("euzeueu")
                sockets[getHash(clientID, camID)] = createSocketService(socketUrl, clientID, camID);
            }
        }
        /**
         * Generates simple "hash" from camera id and namespace
         * @param  {String} clientID client namespace
         * @param  {String} camID    camera id
         * @return {String}          "hash"
         */
        function getHash(clientID, camID) {
            return clientID + ':' + camID;
        }
        /**
         * Wrapper for socket in angular way
         * @param  {Socket}  socket
         * @param  {Angular} $rootScope
         * @return {SocketService}
         */
        function socketServiceFactory(socket, $rootScope) {
            return {
                removeListener: function(eventName, callback) {
                    socket.removeListener(eventName, function() {
                        var args = arguments;
                        $rootScope.$apply(function() {
                            callback.apply(socket, args);
                        });
                    });
                },
                on: function(eventName, callback) {
                    socket.on(eventName, function() {
                        var args = arguments;
                        $rootScope.$apply(function() {
                            callback.apply(socket, args);
                        });
                    });
                },
                emit: function(eventName, data, callback) {

                    socket.emit(eventName, data, function() {
                        var args = arguments;
                        $rootScope.$apply(function() {
                            if (callback) {
                                callback.apply(socket, args);
                            }
                        });
                    })
                }
            };
        }

        return {
            createSocket: function(socketUrl, clientID, camID) {

                if (typeof camID === 'undefined' || camID === 'Mind') {
                    console.error('CreateSocketService rejected!');
                    console.error(clientID);
                    console.error(camID);
                    return;
                }

                addSocket(socketUrl, clientID, camID);
                return sockets[getHash(clientID, camID)];
            }
        }
    };

    socketService.$inject = injectParams;

    sentinelApp.factory('socketService', socketService);

})();