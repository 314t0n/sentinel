var clientModel = require('../model/client');
var streamClientModel = require('../model/streamClient');
var multimap = require('../model/multimap');
/**
 * stream and stream-client namespace events
 * @param  {SocketIO} io      Socket.IO library
 * @param  {Winston}  logger  for logging
 * @param  {Object}   options other options
 */
var listen = function(io, logger, options) {

    if (typeof io === 'undefined') {
        throw "IO must be defined!";
    }

    options = options || {};

    var debugMode = options.debug || false;
    var fpsNumber = options.fps || 10.0;
    var bufferSize = options.bufferSize || 20;
    var clientID = options.clientID || '/stream-client';
    var cameraClientID = options.cameraClientID || '/stream';
    var isStreamingOn = false;
    var streamBuffer = multimap.multimapFactory();
    var chunkBuffer = multimap.multimapFactory();
    // fps in millisec:
    // 33 ~ 1/30
    // 41 ~ 1/24
    // 2  = 1/5
    var timeOut = 1000.0 / fpsNumber;

    logger.log('debug', 'Streamer is listening.');
    logger.log('debug', timeOut);

    var clients = clientModel.create();
    /**
     * Error handler for streaming
     */
    function streamAction(id) {

        try {

            streamHandler(id);

        } catch (e) {
            logger.log('error', e);
        }

    }
    /**
     * Handling buffer
     * @param  {String} id camera name
     */
    function streamHandler(id) {

        if (isStreamRequired(id)) {

            if (streamBuffer.hasKey(id) && streamBuffer.getElemByKey(id).length > 0) {
                streamFrame(id, streamBuffer.getElemByKey(id).shift());
            }

            startStream(id);

        } else {

            clearBuffer(id);

        }
    }
    // stream 1 frame for all client
    function streamFrame(id, frame) {
        /*clients.broadcast('stream', frame);*/
        streamClients.broadcastTo(id, 'stream', frame);
    }
    //for testing
    function streamChunk(frame) {
        clients.broadcast('stream:chunk', frame);
    }
    // prevent buffer override ...
    // deprecated
    function bufferHandler(id) {
        logger.log('debug', '[Stream] buffer ' + streamBuffer.length + ', ' + bufferSize);
        logger.log('debug', streamBuffer.length >= bufferSize);

        if (streamBuffergetElemByKey(id).length >= bufferSize) {
            streamBuffergetElemByKey(id).shift();
        }
    }
    // drop all the frames
    function clearBuffer(id) {
        logger.log('debug', 'Clear buffer: %s', id);
        if (streamBuffer.hasKey(id))
            streamBuffer.getElemByKey(id).length = 0;
        if (chunkBuffer.hasKey(id))
            chunkBuffer.getElemByKey(id).length = 0;

    }
    // fps
    function startStream(id) {
        setTimeout(function() {
            streamAction(id);
        }, timeOut);
    }
    // need for stream
    function isStreamRequired(cameraName) {
        return streamClients.getSocketsByKey(cameraName).length > 0;
    }

    var fpsCounter = 0;
    var isFirst = true;

    // Client connection *****

    var streamClients = streamClientModel.create();

    var clientSocket = io
        .of(clientID)
        .on('connection', function(socket) {

            logger.log('debug', '[Stream] Client connected for streaming.');

            socket.isStreaming = false;

            socket.on('start-stream', function(msg) {

                logger.log('debug', 'Stream starts. ' + socket.id);

                var id = socket.handshake.query['id'];

                logger.log('debug', id);
                logger.log('debug', id);
                logger.log('debug', id);

                streamClients.add(id, socket);
                //első stream indítása
                if (!isStreamRequired(id)) {
                    startStream(id);
                }

            });

            socket.on('stop-stream', function(msg) {
                logger.log('debug', '[Stream] Stream stopped. ' + socket.id);

                var id = socket.handshake.query['id'];
                streamClients.remove(id, socket);

            });

            socket.on('disconnect', function() {
                logger.log('debug', '[Stream] Client disconnected ' + socket.id);

                var id = socket.handshake.query['id'];
                streamClients.remove(id, socket);

            });


            socket.on('close', function() {
                logger.log('debug', '[Stream] Client closed ' + socket.id);

                var id = socket.handshake.query['id'];
                streamClients.remove(id, socket);

            });

        });

    // RPI connection *****

    var streamSocket = io
        .of(cameraClientID)
        .on('connection', function(socket) {

            logger.log('debug', '[Stream] Camera connected for streaming.');

            socket.on('stream:chunk', function(msg) {

                var id = socket.handshake.query['id'];

                if (isStreamRequired(id)) {

                    if (msg === 'end') {

                        var frame = '';

                        while (chunkBuffer.getElemByKey(id).length > 0) {
                            frame += chunkBuffer.getElemByKey(id).shift();
                        }

                        var id = socket.handshake.query['id'];

                        streamBuffer.add(id, frame);


                    } else {

                        chunkBuffer.add(id, msg);

                    }

                    if (streamBuffer.hasKey(id) && streamBuffer.getElemByKey(id).length > 10) {
                        /*isFirst = false;*/
                        streamAction(id);
                    }

                    /*   if (streamBuffer.length > 10) {
                        logger.log('debug', streamBuffer.length);
                    }*/

                }


            });

            socket.on('stream', function(msg) {

                logger.log('debug', 'Datagramm', msg.length);
                logger.log('debug', 'is On?', isStreamingOn);
                logger.log('debug', 'puffer', streamBuffer.length);

                bufferHandler();

                if (isStreamingOn)
                    streamBuffer.push(msg);

            });

            socket.on('disconnect', function() {
                logger.log('debug', '[Stream] Camera for streaming is disconnected ' + socket.id);

                var id = socket.handshake.query['id'];
                streamClients.removeAll(id);
                clearBuffer(id);
              
                clients.broadcast('stream:disconnect');
                             

            });

        });

}

exports.listen = listen;