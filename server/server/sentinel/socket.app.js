var config = require('./config');

// SocketIO

function start(options) {

    var server = options.server;
    var db = options.db;
    var logger = options.logger;
    var config = options.config;

    var io = require('socket.io').listen(server, {
        'destroy buffer size': Infinity,
        'logger': logger,
        'log level': 3,
        'log colors': true,
        'reconnection': true,
        /* "heartbeat timeout": 10*/
        'transports': ['polling', 'websocket']
    });

    var socketioJwt = require('socketio-jwt');
    var jwt = require('jsonwebtoken');

    //config.api.secret
    io.use(socketioJwt.authorize({
        secret: 'secret',
        handshake: true
    }));

    var clients = [];
    var sockets = [];

    io.on('connection', function(socket) {

        logger.log('info', "[Connection] connecting ...");

        if (socket.handshake.query['phone']) {
            logger.log('info', "[Connection] PHONE");
            logger.log('info', "[Connection] PHONE");
            logger.log('info', "[Connection] PHONE");
            logger.log('info', "[Connection] PHONE");
        }

        if (socket.decoded_token.name !== void 0) {

            logger.log('info', "[Connection] [device] token: [%s]: [%s]", socket.decoded_token.name, socket.handshake.query['id']);

            checkCamera(socket.decoded_token.name, acceptSocket(socket), rejectSocket(socket));

        } else if (socket.decoded_token.email !== void 0) {

            logger.log('info', "[Connection] [user] token: [%s]: [%s]", socket.decoded_token.email, socket.handshake.query['id']);

            checkEmail(socket.decoded_token.email, acceptSocket(socket), rejectSocket(socket));

        } else {

            rejectSocket(socket)();

        }

        /*debugConnections();*/

    });

    io.on('reconnect_failed', function(socket) {
        logger.log('warn', "[Connection] Reconnecting falid: %s,id %s", socket.decoded_token.name, socket.handshake.query['id']);
    });
    //todo remove prev and close
    function saveSocket(socket) {

        sockets.push(socket);

        socket.on('disconnect', function() {
            sockets = sockets.map(function(el) {
                if (el !== socket && typeof el !== 'undefined') {
                    return el;
                }
            });
            /*debugConnections();*/
        });

    }

    function debugConnections() {
        var elements = sockets.map(function(el) {
            try {
                return '(' + el.id + ';' + el.handshake.query['id'] + ')';
            } catch (e) {

            }
        }).join(',');
        logger.log('debug', '[Sockets]: %s', elements);
    }

    function checkCamera(name, accept, reject) {
        getCameras(name)
            .on('success', function(items) {
      
                if (items.length > 0) {
                    accept();
                } else {
                    reject();
                }
            })
            .on('error', reject);
    }

    function checkEmail(email, accept, reject) {
        getUsers(email)
            .on('success', function(items) {
                if (items.length > 0) {
                    accept();
                } else {
                    reject();
                }
            })
            .on('error', reject);
    }

    function getCameras(camera) {

        var collection = db.get('camera');

        return collection.find({
            id: camera,
            status: true
        });

    }

    function getUsers(email) {

        var collection = db.get('users');

        return collection.find({
            email: email
        });

    }

    function acceptSocket(socket) {
        return function() {
            logger.log('debug', "[Connection] [%s] successfully authenticated.", socket.handshake.query['id']);
            saveSocket(socket);
        }
    }

    function rejectSocket(socket) {
        return function() {
            logger.log('warn', '[Connection] authentication failed.', socket.decoded_token.name);
            socket.disconnect();
            socket = null;
        }
    }

    //for debug
    /*http://stackoverflow.com/questions/6563885/socket-io-how-do-i-get-a-list-of-connected-sockets-clients*/
    function findClientsSocket(roomId, namespace) {
        var res = [],
            ns = io.of(namespace || "/"); // the default namespace is "/"

        if (ns) {
            for (var id in ns.connected) {
                if (roomId) {
                    var index = ns.connected[id].rooms.indexOf(roomId);
                    if (index !== -1) {
                        res.push(ns.connected[id]);
                    }
                } else {
                    res.push(ns.connected[id]);
                }
            }
        }
        return res;
    }

    return {
        io: io,
        listen: function listen(socket) {
            socket.listen(io, logger, db);
            return this;
        },
        disconnect: function() {
            sockets.forEach(function(el) {
                el.disconnect();
            });
        }
    }

}

exports.start = start