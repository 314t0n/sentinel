//mocha -R spec test/test.socket.io.js

var expect = require("chai").expect;
var assert = require("chai").assert;
var io = require('socket.io-client')
var request = require('supertest');

var winston = require('winston');

var logger = new(winston.Logger)({
    transports: [
        new(winston.transports.Console)({
            level: 'trace'
        })
    ]
});

var connectionString = 'http://192.168.0.14:3000/camera-client';

describe("Socket IO", function() {

    var socket;
    var socketWithoutToken;
    var socketWithToken;

    var streamSocket1;
    var streamSocket2;
    var streamSocket3;

    beforeEach(function(next) {

        socket = io.connect(connectionString, {
            forceNew: true,
            transports: ['websocket', 'polling'],
            query: {
                'id': 'RaspberryPi',
                'token': 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJlbWFpbCI6InVzZXJAdGVzdC5jb20iLCJpYXQiOjE0MzAyNTA1MzcsImV4cCI6MTQzMDU1MDUzN30.56a8QbBgSB5FSf53NwskOEltBDn7cruMqEGaHnvEP9k'
            }
        });

        socketWithoutToken = io.connect(connectionString, {
            transports: ['websocket', 'polling'],
            query: {
                'id': 'cam1'
            }
        });

        socketWithToken = io.connect(connectionString, {
            transports: ['websocket', 'polling'],
            query: {
                'id': 'noSuchAnID',
                'token': 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJlbWFpbCI6InVzZXJAdGVzdC5jb20iLCJpYXQiOjE0MzAyNTA1MzcsImV4cCI6MTQzMDU1MDUzN30.56a8QbBgSB5FSf53NwskOEltBDn7cruMqEGaHnvEP9k'
            }
        });

        streamSocket1 = io.connect(connectionString, {
            forceNew: true,
            transports: ['websocket', 'polling'],
            query: {
                'id': 'camPi',
                'token': 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJlbWFpbCI6InVzZXJAdGVzdC5jb20iLCJpYXQiOjE0MzAyNTA1MzcsImV4cCI6MTQzMDU1MDUzN30.56a8QbBgSB5FSf53NwskOEltBDn7cruMqEGaHnvEP9k'
            }
        });

        streamSocket2 = io.connect(connectionString, {
            forceNew: true,
            transports: ['websocket', 'polling'],
            query: {
                'id': 'camPi',
                'token': 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJlbWFpbCI6InVzZXJAdGVzdC5jb20iLCJpYXQiOjE0MzAyNTA1MzcsImV4cCI6MTQzMDU1MDUzN30.56a8QbBgSB5FSf53NwskOEltBDn7cruMqEGaHnvEP9k'
            }
        });

        streamSocket3 = io.connect(connectionString, {
            forceNew: true,
            transports: ['websocket', 'polling'],
            query: {
                'id': 'camPi',
                'token': 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJlbWFpbCI6InVzZXJAdGVzdC5jb20iLCJpYXQiOjE0MzAyNTA1MzcsImV4cCI6MTQzMDU1MDUzN30.56a8QbBgSB5FSf53NwskOEltBDn7cruMqEGaHnvEP9k'
            }
        });

        socket.on('connect', function() {
            console.log('\t\tworked...');
            next();
        });

        socket.on('disconnect', function() {
            console.log('\t\tdisconnected...');
        })
    });

    afterEach(function(next) {
        // Cleanup
        if (socket.connected) {
            console.log('\t\tdisconnecting...');
            socket.disconnect();
        } else {
            console.log('\t\tno connection to break...');
        }
        next();
    });

    describe('Connection', function() {

        it('testing connection', function(next) {

            expect(socket.connected).to.equal(true);

            socket.on('camera:status', function(msg) {
                console.log('\t\tstatus...');
                expect(msg.id).to.equal("camPi");
                expect(msg.id).to.not.equal("cam1");
                expect(msg.status).to.equal(true);
            });

            next();

        });

        it('testing connection without token', function(next) {

            expect(socketWithoutToken.connected).to.equal(false);
            expect(socketWithToken.connected).to.equal(false);

            next();

        });

    });

    describe('Streaming', function() {

        it('multiple clients', function(next) {

            function sendStreamRequest(streamSocket, cameraSocket) {
                var command = isStreamingOn ? 'start-stream' : 'stop-stream';
                streamSocket.emit(command);
                cameraSocket.emit('cam', {
                    'command': command,
                    'id': 'camPi'
                });
            }

            sendStreamRequest(streamSocket1, socket);
            sendStreamRequest(streamSocket2, socket);
            sendStreamRequest(streamSocket3, socket);

            var isStream1On = false;
            var isStream2On = false;
            var isStream3On = false;

            function registerStream(streamSocket){

                streamSocket.on('stream', function(msg) {

                    isStream1On = true;

                });

            }

            next();

        });


    });


});