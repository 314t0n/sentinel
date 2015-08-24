var expect = require("chai").expect;
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

describe("Api routing", function() {

    var url = "http://localhost:3000";

    var token = null;

    before(function(done) {
        request(url)
            .post('/api/v1/auth/login')
            .send({
                email: 'user@test.com',
                password: 'test'
            })
            .end(function(err, res) {
                token = res.body.token;
                done();
            });
    });

    describe("Config", function() {

        it("should have statuscode 403 without token", function(next) {
            request(url)
                .get('/api/v1/config')
                .expect(403)
                .end(function(err, res) {
                    if (err) {
                        console.log(err);
                        throw err;
                    }
                    next();
                });
        });

        it("should have statuscode 200 with token", function(next) {
            request(url)
                .get('/api/v1/config')
                .set('Authorization', token)
                .expect(200)
                .end(function(err, res) {
                    if (err) {
                        console.log(err);
                        throw err;
                    }
                    next();
                });
        });

        it("should have return the first camera with id cam1", function(next) {
            request(url)
                .get('/api/v1/config/1')
                .set('Authorization', token)
                .expect(200)
                .end(function(err, res) {
                    if (err) {
                        console.log(err);
                        throw err;
                    }
                    expect(res.body.config.camera.name).to.equal('Laptop01');
                    next();
                });
        });

        it("should have return the camera by id cam1", function(next) {
            request(url)
                .get('/api/v1/config/cam1')
                .set('Authorization', token)
                .expect(200)
                .end(function(err, res) {
                    if (err) {
                        console.log(err);
                        throw err;
                    }
                    expect(res.body.config.camera.name).to.equal('cam1');
                    next();
                });
        });

        it("should have return the camera by id camPi", function(next) {
            request(url)
                .get('/api/v1/config/camPi')
                .set('Authorization', token)
                .expect(200)
                .end(function(err, res) {
                    if (err) {
                        console.log(err);
                        throw err;
                    }
                    expect(res.body.config.camera.name).to.equal('camPi');
                    next();
                });
        });

    });

    describe("Config/Camera", function() {
        it("should return all the cameras", function(next) {
            request(url)
                .get('/api/v1/config/camera')
                .set('Authorization', token)
                .expect(200)
                .end(function(err, res) {
                    if (err) {
                        console.log(err);
                        throw err;
                    }
                    expect(res.body.cameras[0].name).to.equal('cam1');
                    next();

                });
        });


        /*   it("should return cam1 for query.name = cam1", function() {

            request(url)
                .get('/api/v1/config', function(req, res) {
                    res.send(200, {
                        name: 'cam1'
                    });
                })
                .end(function(err, res) {
                    if (err) {
                        throw err;
                    }
                    res.body.should.have.property('_id');
                    expect(res[0].name).to.equal('cam1');
                    res.should.have.status(400);
                    next();
                });


        });*/

        /*   it("should change imagelog property of cam1", function() {

            request(url)
                .get('/api/v1/config', function(req, res) {
                    res.send(200, {
                        name: 'cam1'
                    });
                })
                .end(function(err, res) {

                    if (err) {
                        throw err;
                    }

                    var cam = res[0];

                    cam.imagelog = {
                        status: false,
                        storeImage: true,
                        interval: 10,
                        storeDays: 1,
                    };

                    request(url)
                        .post('/api/v1/config')
                        .send(cam)

                    .end(function(err, res) {

                        if (err) {
                            throw err;
                        }

                        request(url)
                            .get('/api/v1/config', function(req, res) {
                                res.send(200, {
                                    name: 'cam1'
                                });
                            })
                            .end(function(err, res) {

                                if (err) {
                                    throw err;
                                }

                                var cam = res[0];

                                expect(cam.imagelog.status).to.equal(false);
                                expect(cam.imagelog.storeImage).to.equal(true);
                                expect(cam.imagelog.interval).to.equal(10);
                                expect(cam.imagelog.storeDays).to.equal(1);

                                res.should.have.status(400);

                                next();

                            });

                    });

                });



        });*/
    });

});