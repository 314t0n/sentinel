/**
 * Module dependencies
 */

var config = require('./config');
var Promise = require("bluebird");
var join = Promise.join;
var _ = require('underscore');

// API

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

    var sockets = [];

    io.on('connection', function(socket) {

        logger.log('info', "[Connection] connecting ... =========================");
       
        if (socket.handshake.query['phone']) {
            logger.log('info', "[Connection] PHONE");
        }

        logger.log('info', socket.decoded_token.name || socket.decoded_token.email);

        if (!_.isUndefined(socket.decoded_token.name)) {

            logger.log('info', "[Connection] [device] token: [%s]: [%s]", socket.decoded_token.name, socket.handshake.query['id']);

            var cameraId = socket.decoded_token.name;
            //creates promise
            join(getCameras(cameraId), isAllValid).then(socketHandler(socket, 'device'));

        } else if (!_.isUndefined(socket.decoded_token.email)) {

            logger.log('info', "[Connection] [user] token: [%s]: [%s]", socket.decoded_token.email, socket.handshake.query['id']);

            var cameraId = socket.handshake.query['id'];
            var email = socket.decoded_token.email;
            //creates promise
            join(getCameras(cameraId), getUserByEmail(email), isAllValid).then(socketHandler(socket, 'user'));

        } else {
            rejectSocket(socket)();
        }

        /*debugConnections();*/

    });

    io.on('reconnect_failed', function(socket) {
        logger.log('warn', "[Connection] Reconnecting falid: %s,id %s", socket.decoded_token.name, socket.handshake.query['id']);
    });
    /**
     * Handling new socket connections
     *
     * @param  {Object} socket new Socket
     * @param  {String} type   for logging
     * @return {Function}      
     */
    function socketHandler(socket, type) {

        return function(isValid) {

            if (isValid) {
                logger.log('debug', "[Connection] [user] token: [%s]: [%s] accepted", socket.decoded_token.email, socket.handshake.query['id']);
                acceptSocket(socket);
            } else {
                logger.log('debug', "[Connection] [user] token: [%s], [%s], [%s] rejected", socket.decoded_token.email, socket.handshake.query['id'], socket.decoded_token.name || socket.decoded_token.email);
                rejectSocket(socket, type);
            }

        }
    }

    //todo remove prev and close
    function saveSocket(socket) {

        sockets.push(socket);

        socket.on('disconnect', function() {
            sockets = sockets.map(function(el) {
                if (el !== socket && !_.isUndefined(el)) {
                    console.log('socket eltávolítva');
                    return el;
                }
            });
            /*debugConnections();*/
        });

    }
    /**
     * Search for camera by name
     * @param  {String} camera name
     * @return {Object}        camera
     */
    function getCameras(camera) {

        return db.query('camera').filter({
            name: camera,
            status: true
        }).first();

    }
    /**
     * Search for user by email
     * @param  {String} email 
     * @return {Object}      
     */
    function getUserByEmail(email) {

        return db.query('users').filter({
            email: email
        }).first();

    }
    /**
     * Accept actions 
     * @param  {Object} socket 
     */
    function acceptSocket(socket) {
        logger.log('debug', "[Connection] [%s] successfully authenticated.", socket.handshake.query['id']);
    }
    /**
     * Reject actions
     * @param  {Object} socket 
     * @param  {String} type   for logging    
     */
    function rejectSocket(socket, type) {      
        logger.log('warn', '[Connection] [%s] authentication failed.', type, socket.decoded_token);
        socket.disconnect();       
    }
   
    function validateItem(item) { 
        return !_.isUndefined(item) && _.keys(item).length > 0;
    }

    function validateItems() {
        var args = [].slice.call(arguments);  
        return _(args).chain()
            .map(validateItem)
            .value();
    }

    function isAllValid() {
        var validated = validateItems.apply(null, arguments);
        return _.every(validated, function(v) {
            return v === true;
        });
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