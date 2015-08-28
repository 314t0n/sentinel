var express = require('express');
var router = express.Router();
var url = require('url');
var Promise = require('bluebird');

var utils = require('../../utils');
var isUndefined = utils.isUndefined;
var hasKeys = utils.hasKeys;

var dbHelper = require('../../database/helpers/config-helper');

var cameraModel = require('../../model/camera');

var logger = require('../../logger').app;
var authorizationHelper = require('../../utils').authorizationHelper;

router.get('/camera', authorizationHelper, getCameras);
router.post('/camera', authorizationHelper, addCamera);
router.put('/camera/:id', authorizationHelper, updateCamera);
router.delete('/camera/:id', authorizationHelper, deleteCamera);

router.get('/:id', authorizationHelper, get);
router.get('/', authorizationHelper, get);
/**
 * Add new camera
 */
function addCamera(req, res) {
    var db = req.db;
    var query = getQuery(req);
    var camera = cameraModel.create(req.body.name);

    db.save('camera', camera)
        .on('success', function() {
            res.sendStatus(200);
        })
        .on('error', function(err) {
            if (err) {
                logger.log('error', err);
            }
            res.sendStatus(500);
        });
}

/**
 * Update camera by ID
 */
function updateCamera(req, res) {

    var db = req.db;
    var query = getQuery(req);

    var camera = req.body;

    logger.log('debug', '---> put');
    logger.log('debug', req.body);

    collection.updateById('camera', camera).on('success', function() {
        res.sendStatus(200);
    }).on('error', function(err) {

        if (err) {
            logger.log('error', err);
        }
        res.sendStatus(500);
    });
}
/**
 * Delete camera by ID
 */
function deleteCamera(req, res) {

    var db = req.db;
    var camera = req.body;

    console.log(req.params.id);
    console.log(req.body);

    db.remove('camera', {
        _id: req.params.id
    })
        .on('success', function() {
            res.sendStatus(200);
        })
        .on('error', function(err) {
            if (err) {
                logger.log('error', err);
            }
            res.sendStatus(500);
        });
}

/**
 * Get All the cameras
 */
function getCameras(req, res) {

    logger.log('debug', 'getCameras');

    var db = req.db;
    var query = getQuery(req);

    var cameras = db.query('camera').filter({
        isDeleted: {
            $ne: true
        }
    }).all();

    cameras
        .on('success', function(items) {

            res.json({
                cameras: items
            });

        })
        .on('error', errorResponse(res));


}

function errorResponse(res) {
    return function(err) {
        logger.log("error", err);
        res.sendStatus(500);
    }
}

/**
 * Get config data
 */
function get(req, res) {

    var db = req.db;
    var query = getQuery(req);

    if (req.params !== void 0 && req.params.id !== void 0) {
        query['id'] = req.params['id'];
    }

    var cameras = db.query('camera');

    if (hasKeys(query, ['id'])) {

        var config = cameras.filter({
            'name': query.id
        }).first()

        config
            .on('success', function(item) {

                if (typeof item === 'undefined') {
                    res.sendStatus(404);
                } else {

                    res.json({
                        config: {
                            camera: item
                        }
                    });
                }

            })
            .on('error', errorResponse(res));

    } else {

        cameras.all()
            .on('success', function(items) {
                res.json({
                    config: items
                });
            })
            .on('error', errorResponse(res));

    }
}
/**
 * save config
 */
router.put('/:id', authorizationHelper, function(req, res) {

    var db = req.db;

    var camera = req.body;

    if (!req.body) {
        return res.sendStatus(400);
    }

    logger.log('debug', camera);

    if (!validateConfigData(camera)) {

        logger.log('error', 'validateConfigData() error');

        res.sendStatus(400);

        return;
    }
    //convert 

    var data = cameraModel.create(camera.name);

    data._id = camera._id;
    //convert
    data.status = !!camera.status;
    data.imagelog.status = !!camera.imagelog.status;
    data.imagelog.storeImage = !!camera.imagelog.storeImage;
    data.imagelog.interval = parseInt(camera.imagelog.interval, 10);
    data.imagelog.storeDays = parseInt(camera.imagelog.storeDays, 10);
    data.motionDetect.status = !!camera.motionDetect.status;
    data.motionDetect.storeImage = !!camera.motionDetect.storeImage;
    data.motionDetect.storeDays = parseInt(camera.motionDetect.storeDays, 10);
    data.motionDetect.threshold = parseInt(camera.motionDetect.threshold, 10);
    data.motionDetect.sensitivy = parseInt(camera.motionDetect.sensitivy, 10);
    data.resolution.x = parseInt(camera.resolution.x, 10);
    data.resolution.y = parseInt(camera.resolution.y, 10);

    db.query('camera').filter({
        _id: camera._id
    }).update(data)
        .on('success', function(err, doc) {
            res.sendStatus(200);
        })
        .on('error', function(err) {
            if (err) {
                logger.log('error', err);
            }
            res.sendStatus(500);
        });

});
/**
 * Validate camera object
 * @param  {Camera} camera
 * @return {Boolean} is attributes valid
 */
function validateConfigData(camera) {

    try {

        assertEqual(true, validateInterval(camera.imagelog.interval, 1, 86400));
        assertEqual(true, validateInterval(camera.imagelog.storeDays, 1, 3));
        assertEqual(true, validateInterval(camera.motionDetect.storeDays, 1, 3));
        assertEqual(true, validateInterval(camera.motionDetect.threshold, 0, 1920 * 1080));
        assertEqual(true, validateInterval(camera.motionDetect.sensitivy, 0, Number.MAX_VALUE));
        assertEqual(true, validateInterval(camera.resolution.x, 1, 1920));
        assertEqual(true, validateInterval(camera.resolution.y, 1, 1080));

        console.log(typeof camera.status);
        console.log(typeof camera.imagelog.status);
        console.log(typeof camera.imagelog.storeImage);
        console.log(typeof camera.motionDetect.status);
        console.log(typeof camera.motionDetect.storeImage);
        //todo ez nem boolean why
        //assertEqual(true, typeof camera.status === 'boolean');
        //@TODO
        //assertEqual(true, typeof camera.isDeleted === 'boolean');
        assertEqual(true, typeof camera.imagelog.status === 'boolean');
        assertEqual(true, typeof camera.imagelog.storeImage === 'boolean');
        assertEqual(true, typeof camera.motionDetect.status === 'boolean');
        assertEqual(true, typeof camera.motionDetect.storeImage === 'boolean');

        return true;
    } catch (e) {
        return false;
    }

}
/**
 * Given value inside interval
 * @param  {Float} value
 * @param  {Float} min
 * @param  {Float} max
 * @return {Boolean}
 */
function validateInterval(value, min, max) {
    logger.log('debug', 'validateInterval() - value: ' + value + ' min: ' + min + ' max: ' + max);
    return min <= value && value <= max;
}
/**
 * Simple assert
 */
function assertEqual(expected, actual) {
    if (expected !== actual) {
        logger.log('error', 'assertEqual() - expected: ' + expected + ' actual: ' + actual, typeof expected, typeof actual);
        throw new Error();
    }
}
module.exports = router;
/**
 * query from url
 */
function getQuery(req) {
    var url_parts = url.parse(req.url, true);
    return url_parts.query;
}