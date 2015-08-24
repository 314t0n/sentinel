//mocha -R spec test/test.model.js

var expect = require("chai").expect;
var assert = require("chai").assert;
var mongo = require('mongoskin');
var request = require('supertest');

var winston = require('winston');


var logger = new(winston.Logger)({
    transports: [
        new(winston.transports.Console)({
            level: 'trace'
        })
    ]
});


var cameraFactory = require('../server/sentinel/model/camera');
var clientModel = require('../server/sentinel/model/client');
var streamClientModel = require('../server/sentinel/model/streamClient');
var notificationFactory = require('../server/sentinel/model/notification');
var imagelogFactory = require('../server/sentinel/model/Imagelog');
var MissingParameterError = require('../server/sentinel/model/exceptions').MissingParameterError;

describe("Models", function() {

    describe('Notification', function() {

        it('testing notification attributes', function(next) {

            var date = new Date();

            var n = notificationFactory.create("cam1", "test message", "level", "data:image", date);

            expect(n.cam).to.equal("cam1");
            expect(n.message).to.equal("test message");
            expect(n.level).to.equal("level");
            expect(n.image).to.equal("data:image");
            expect(n.date).to.equal(date);

            next();

        });

        it('testing errors', function(next) {

            assert.throws(notificationFactory.create, MissingParameterError, "cam is undefined!");

            next();

        });

    });

    describe('Imagelog', function() {

        it('testing imagelog attributes', function(next) {

            var date = new Date();

            var n = imagelogFactory.create("test", "data:image", "cam1", date);

            expect(n.cam).to.equal("cam1");
            expect(n.name).to.equal("test");
            expect(n.image).to.equal("data:image");
            expect(n.date).to.equal(date);

            next();

        });

        it('testing errors', function(next) {

            assert.throws(imagelogFactory.create, MissingParameterError, "name is undefined!");

            next();

        });

    });

    describe('Camera', function() {

        it('testing camera attributes', function(next) {

            var n = cameraFactory.create("test");

            expect(n.name).to.equal("test");
            expect(n.status).to.equal(false);
            expect(n.imagelog.status).to.equal(false);
            expect(n.motionDetect.status).to.equal(false);

            next();

        });

        it('testing errors', function(next) {

            assert.throws(cameraFactory.create, MissingParameterError, "name is undefined!");

            next();

        });

    });

    describe('Client', function() {

        it('testing add/remove/haskey', function(next) {

            var client = clientModel.create();

            client.put("01", {});
            client.put("02", {});
            client.put("03", {});
            client.put("04", {});

            expect(client.hasKey("01")).to.equal(true);
            client.removeById("02");

            expect(client.hasKey("02")).to.equal(false);

            client.each(function(el) {
                el.id = "test";
                return el;
            });

            client.put("05", {});

            var arr = client.filter(function(el) {
                return el.id === "test";
            });

            expect(arr.length).to.equal(3);

            next();

        });

    });

    describe("StreamClient", function() {

        var socket1 = {
            id: 'socket1',
            emit: function(id, msg) {
                console.log('\tsocket1: ', id, msg);
            }
        };
        var socket2 = {
            id: 'socket2',
            emit: function(id, msg) {
                console.log('\tsocket2: ', id, msg);
            }
        };
        var socket3 = {
            id: 'socket3',
            emit: function(id, msg) {
                console.log('\tsocket3: ', id, msg);
            }
        };
        var socket4 = {
            id: 'socket4',
            emit: function(id, msg) {
                console.log('\tsocket4: ', id, msg);
            }
        };


        it("testing add remove to one chanel", function(next) {

            var streamClients = streamClientModel.create();

            streamClients.add('test1', socket1);
            streamClients.add('test1', socket2);
            streamClients.add('test1', socket3);
            streamClients.remove('test1', socket3);

            streamClients.broadcastTo('test1', 'test', 'message1');

            var elems = streamClients.getSocketsByKey('test1');

            expect(elems.length).to.equal(2);

            next();

        });

        it("testing add and broadcastTo to mutliple chanel", function(next) {

            var streamClients = streamClientModel.create();

            streamClients.add('test1', socket1);
            streamClients.add('test1', socket2);
            streamClients.add('test2', socket3);
            streamClients.add('test2', socket4);
            streamClients.add('test1', socket4);

            streamClients.broadcastTo('test1', 'test_01', 'message1');
            streamClients.broadcastTo('test2', 'test_02', 'message2');

            var elems1 = streamClients.getSocketsByKey('test1');
            var elems2 = streamClients.getSocketsByKey('test2');

            expect(elems1.length).to.equal(3);
            expect(elems2.length).to.equal(2);

            next();

        });


        it("testing removeAll", function(next) {

            var streamClients = streamClientModel.create();

            streamClients.add('test1', socket1);
            streamClients.add('test1', socket2);
            streamClients.add('test2', socket3);
            streamClients.add('test2', socket4);
            streamClients.add('test1', socket4);

            streamClients.removeAll('test1');

            expect(streamClients.getSocketsByKey('test1').length).to.equal(0);

            next();

        });

    });


});