var imagelogDBHelper = require('../database/helpers/imagelog-helper');
var clientModel = require('../model/client');
var streamClientModel = require('../model/streamClient');
var isUndefined = require('../utils').isUndefined;
var imagelogFactory = require('../model/imagelog');
var fs = require('fs');
/**
 * camera and camera-client namespace events
 * @param  {SocketIO} io      Socket.IO library
 * @param  {Winston}  logger  for logging
 * @param  {Monk}     db      DAO
 * @param  {Object}   options other options
 */
var cameraController = function cameraController(io, logger, db, options) {

    logger.log('debug', '[Camera] listening ...');

    var cameraClients = clientModel.create();
    var userClients = streamClientModel.create();
    /**
     * Sending freespace ping to camera
     * @param  {String} id  camera id
     */
    function freespace(id) {
        cameraClients.emit(id, {
            'command': 'system:freespace'
        });
    };
    /**
     * Shutdown camera device
     * @param  {String} id  camera id
     * @param  {Object} msg message to camera
     */
    function shutdownService(id, msg) {
        cameraClients.emit(id, {
            'command': 'system:shutdown'
        });
        cameraClients.disconnect(msg.id);
    };
    /**
     * Start strean nessage to canera
     * @param  {String} id  camera id
     */
    function startStream(id) {
        cameraClients.emit(id, {
            'command': 'stream',
            'value': true
        });
    };
    /**
     * Stop stream message to camera
     * @param  {String} id  camera id
     */
    function stopStream(id) {
        cameraClients.emit(id, {
            'command': 'stream',
            'value': false
        });
    };
    /**
     * Update config values
     * @param  {String} id  camera id
     * @param  {Object} msg message to camera
     */
    function systemUpdate(id, msg) {
        msg['command'] = 'system:config'
        cameraClients.emit(id, msg);
    };
    /**
     * Apply system command to the camera client
     * @return {Object}
     */
    var systemCommandHandler = (function() {

        var commands = {};
        commands['freespace'] = freespace;
        commands['shutdown-service'] = shutdownService;
        commands['start-stream'] = startStream;
        commands['stop-stream'] = stopStream;
        commands['system-update'] = systemUpdate;

        return {
            applyCommand: function(msg, socket, camId) {

                logger.log('debug', '[Camera] System command %s', msg.command);

                if (msg.command && commands.hasOwnProperty(msg.command)) {

                    logger.log('debug', '[Camera] System command %s', msg.command);

                    commands[msg.command].call(socket, camId, msg);

                } else {
                    logger.log('error', '[Camera] Unknown command: ', msg);
                }

            }
        }

    })();

    /**
     * Send camera statuses
     * @param  {Socket} socket Socket.IO
     */
    function sendInitStatus(socket) {

        var id = socket.handshake.query['id'];

        logger.log('debug', 'sendInitStatus');

        if (cameraClients.hasKey(id)) {

            userClients.broadcastTo(id, 'camera:status', {
                cam: id,
                status: true
            });

        } else {

            userClients.broadcastTo(id, 'camera:status', {
                cam: id,
                status: false
            });

        }

    }
    /**
     * Handling client connect event
     * @param  {Socket} socket
     */
    function clientConnectiHandler(socket) {

        var id = socket.handshake.query['id'];

        userClients.add(id, socket);

        logger.log('debug', '[Connection] [Camera] client connected with device id: %s %s', id, socket.id);

        sendInitStatus(socket);

    }
    /**
     * Web client socket events
     * @type {Socket.IO}
     */
    var clientSocket = io
        .of('/camera-client')
        .on('connection', function(socket) {

            clientConnectiHandler(socket);

            /**
             * Handling system commands
             * @param  {Object} message from client
             */
            socket.on('cam', function(msg) {

                var id = socket.handshake.query['id'];

                logger.log('debug', '[Camera] %s %s', id, socket.id);

                systemCommandHandler.applyCommand(msg, socket, id);

            });
            /**
             * Error handling
             */
            socket.on('error', function(reason) {
                logger.log('error', '[Camera] error %s', reason);
            })
            /**
             * Disconnect event on client side
             */
            socket.on('disconnect', function() {

                var id = socket.handshake.query['id'];

                logger.log('debug', '[Camera] [Disconnect] client disconnectet with device id: %s', socket.handshake.query['id']);

                userClients.remove(id, socket);

            });

        });
    /**
     * Handlig camera connection event
     * @param  {Socket} socket
     */
    function cameraConnectHandler(socket) {
        var id = socket.handshake.query['id'];
        //store id
        cameraClients.put(id, socket);

        logger.log('debug', '[Camera] connected: [%s]', id);
        logger.log('debug', '[Camera] number of connections: %d', cameraClients.size());
        //notify frontend
        userClients.broadcastTo(id, 'camera:status', {
            cam: id,
            status: true
        });

        systemCommandHandler.applyCommand({
            command: 'freespace'
        }, socket, id);

        syncConfig(id);
    }
    /**
     * Camera client socket events
     * @type {Socket.IO}
     */
    var cameraSocket = io
        .of('/camera')
        .on('connection', function(socket) {

            cameraConnectHandler(socket);
            /**
             * Imagelog message
             * @param  {Object} msg camera message
             */
            socket.on('imagelog', function(msg) {

                var id = socket.handshake.query['id'];

                logger.log('debug', '[Camera] Imagelog message.', id);
                persistImageLog(msg, socket.handshake.query['id']);
                /*saveToFile(msg);*/
                userClients.broadcastTo(id, 'imagelog:add', msg);

            });
            /**
             * Device space message
             * @param  {Object} msg camera message
             */
            socket.on('freespace', function(msg) {

                var id = socket.handshake.query['id'];

                logger.log('debug', '[Camera] Imagelog message.', msg);

                msg.cam = id;
                updateSizeData(id, msg);
                userClients.broadcastTo(id, 'camera:freespace', msg);

            });
            /**
             * Disconnect event
             */
            socket.on('disconnect', function() {

                var id = socket.handshake.query['id'];

                logger.log('debug', '[Camera] camera disconnected: %s', id);
                //notify frontend
                cameraClients.remove(socket);
                userClients.broadcastTo(id, 'camera:status', {
                    cam: id,
                    status: false
                });

            });
            /**
             * Close event
             */
            socket.on('close', function() {

                var id = socket.handshake.query['id'];

                logger.log('debug', '[Camera] camera closed: %s', id);
                //notify frontend
                cameraClients.remove(socket);
                userClients.broadcastTo(id, 'camera:status', {
                    cam: id,
                    status: false
                });

            });

        });
    /**
     * Sending config data to camera client
     * @param  {String} id camera name
     * @return {void}
     */
    function syncConfig(id) {

        logger.log('info', 'Synchronizing Config for %s', id);

        db.query('camera').filter({
                name: id
            },
            function(err, items) {

                if (err) {
                    logger.log('error', err);
                }

                var camera = items[0];

                var config = [{
                    name: 'status',
                    value: camera.status
                }, {
                    name: 'imagelog.status',
                    value: camera.imagelog.status
                }, {
                    name: 'imagelog.storeImage',
                    value: camera.imagelog.storeImage
                }, {
                    name: 'imagelog.interval',
                    value: camera.imagelog.interval
                }, {
                    name: 'imagelog.storeDays',
                    value: camera.imagelog.storeDays
                }, {
                    name: 'motionDetect.status',
                    value: camera.motionDetect.status
                }, {
                    name: 'motionDetect.storeImage',
                    value: camera.motionDetect.storeImage
                }, {
                    name: 'motionDetect.sensitivy',
                    value: camera.motionDetect.sensitivy
                }, {
                    name: 'motionDetect.storeDays',
                    value: camera.motionDetect.storeDays
                }, {
                    name: 'resolution.x',
                    value: camera.resolution.x
                }, {
                    name: 'resolution.y',
                    value: camera.resolution.y
                }];

                cameraClients.emit(id, {
                    command: 'system:config:batch',
                    data: config
                });
            });
    }
    /**    
     * Persist size data
     * @param  {String} name camera name
     * @param  {Object} data size data
     * @return {void}
     */
    function updateSizeData(name, data) {

        var update = db.query('camera').filter({
            'name': name
        }).update({
            size: {
                total: data.total,
                free: data.free,
            }
        });

        update.on('success', function() {
            logger.log('info', '%s size updated', name);
        }).on('error', function(err) {
            logger.log('error', err);
        });

    }

    /**
     * Persist image to DB
     * @param  {Object} data     Image + meta data
     * @param  {String} cameraID Device id
     * @return {Void}
     */
    function persistImageLog(data, cameraID) {

        var imagelog = imagelogFactory.create(data.date, data.image, cameraID, new Date(data.date));

        db.save('imagelogs', imagelog)
            .on('success', function() {
                logger.log('debug', 'Imagelog message persisted.');
            })
            .on('error', function(err) {
                logger.log('error', err);
            });;

    }
    /**
     * Test function
     * @param  {[type]} data [description]
     * @return {[type]}      [description]
     */
    function saveToFile(data) {
        fs.writeFile("d:/storage/Copy/" + new Date(data.date).getTime() + ".jpg", new Buffer(data.image, 'base64'), function(err) {
            if (err) {
                logger.log('error', err);
            } else {
                logger.log('debug', 'File saved.');
            }
        });
    }
}

exports.listen = cameraController;