define(['sentinel.app'], function(app) {
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

            console.log('Socket cam id: ', socketUrl, clientID, cameraID);

            var socket = io.connect(socketUrl + clientID, {
                forceNew: true,
                transports: ['websocket', 'polling'],
                query: {
                    'id': id,
                    'token': $localStorage.token
                }
            });

            console.log(socket);

            socket.on('error', function(err) {
                console.error(err);
            });

            socket.on('disconnect', function(err) {
                console.log('disconnect', clientID, id);
                delete sockets[getHash(clientID, id)]
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

                if (typeof camID === 'undefined') {
                    console.error('CreateSocketService rejected!', clientID, camID);
                    return;
                }

                addSocket(socketUrl, clientID, camID);
                return sockets[getHash(clientID, camID)];
            }
        }
    };

    socketService.$inject = injectParams;
    app.register.factory('socketService', socketService);

});