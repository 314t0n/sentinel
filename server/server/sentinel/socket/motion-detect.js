var clientModel = require('../model/client');
var streamClientModel = require('../model/streamClient');
var notifcationFactory = require('../model/notification');
/**
 * motion-detect and motion-detect-client namespace events
 * @param  {SocketIO} io      Socket.IO library
 * @param  {Winston}  logger  for logging
 * @param  {Monk}     db      DAO
 * @param  {Object}   options other options
 */
var motionDetectController = function(io, logger, db, options) {

    options = options || {};

    var cameraID = options.userClientID || '/motion-detect';
    var userClientID = options.userClientID || '/motion-detect-client';

    logger.log('debug', 'Motion detector is listening.');

    var userClients = streamClientModel.create();
    var cameraClients = clientModel.create();
    /**
     * Handling camera connection event
     * @param  {Socket} socket
     */
    var cameraConnectHandler = function(socket) {

            logger.log('debug', 'Client connected for motion detect.');

            var id = socket.handshake.query['id'];

            var msg = {};

            msg.message = 'A [' + socket.handshake.query['id'] + '] kapcsolódott';

            persistNotification(msg, socket.handshake.query['id'], 'info');

            userClients.broadcastTo(id, 'notification:add', msg.message);

        }
        /**
         * Handling client connection event
         * @param  {Socket} socket
         */
    var clientConnectHandler = function(socket) {

        var id = socket.handshake.query['id'];

        logger.log('debug', 'Client connected for Motion detection.');

        userClients.add(id, socket);
    }

    /**
     * Client socket events
     * @type {Socket.IO}
     */
    var clientSocket = io
        .of(userClientID)
        .on('connection', function(socket) {

            clientConnectHandler(socket);

            socket.on('disconnect', function() {

                var id = socket.handshake.query['id'];

                logger.log('debug', 'Client disconnected from md' + socket.id);

                userClients.remove(id, socket);

            });

        });

    /**
     * Camera socket events
     * @type {Socket.IO}
     */
    var cameraSocket = io
        .of(cameraID)
        .on('connection', function(socket) {

            cameraConnectHandler(socket);
            /**
             * Handling motion detect event
             * Save to DB
             * Notify the client
             * @param  {Object} msg
             */
            socket.on('motiondetect', function(msg) {

                var id = socket.handshake.query['id'];

                logger.log('debug', 'Motion Detect message. ', msg.date, socket.handshake.query['id']);

                msg.message = 'A [' + socket.handshake.query['id'] + '] kamera mozgást érzékelt';

                persistNotification(msg, socket.handshake.query['id'], 'warning');

                userClients.broadcastTo(id, 'notification:add', msg);
                //lightweight message for mobile
                userClients.broadcastTo(id, 'notification:add:mobile', msg.message);
                /*saveToFile(msg);*/

            });
            /**
             * Handling camera disconnection
             */
            socket.on('disconnect', function() {

                var msg = {};

                var id = socket.handshake.query['id'];

                msg.message = 'A [' + socket.handshake.query['id'] + '] szétkapcsolódott';

                persistNotification(msg, socket.handshake.query['id'], 'info');

                userClients.broadcastTo(id, 'notification:add', msg.message);

                logger.log('debug', 'Client disconnected ' + socket.id);

            });

        });
    /**
     * Save notification to database
     * @param  {Object} data  notification data
     * @param  {String} id    camera id
     * @param  {String} level alert level
     */
    function persistNotification(data, id, level) {

        var notification = notifcationFactory.create(id, data.message, level, data.image);
        notification.isUnread = true;

        db.save('notifications', notification)
            .on('success', function() {
                logger.log('debug', 'Notification message persisted.');
            })
            .on('error', function(err) {
                logger.log('error', err);
            });

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

exports.listen = motionDetectController;