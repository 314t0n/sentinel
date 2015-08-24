var express = require('express');
var router = express.Router();
var url = require('url');
var Promise = require('bluebird');

var utils = require('../../utils');
var isUndefined = utils.isUndefined;
var hasKeys = utils.hasKeys;

var dbHelper = require('../../database/config-helper');

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
    var collection = db.get('camera');

    var camera = cameraModel.create(req.body.name);

    camera.id = req.body.name;

    collection.insert(camera, function(err) {

        if (err) {
            logger.log('error', err);
        }
        res.json({
            status: err === null ? 'success' : 'failed'
        });
    });
}
/**
 * Update camera by ID
 */
function updateCamera(req, res) {

    var db = req.db;
    var query = getQuery(req);
    var collection = db.get('camera');

    var camera = req.body;

    logger.log('debug', '---> put');
    logger.log('debug', req.body);

    collection.updateById(camera._id, camera, function(err) {

        if (err) {
            logger.log('error', err);
        }
        res.json({
            status: err === null ? 'success' : 'failed'
        });
    });
}
/**
 * Delete camera by ID
 */
function deleteCamera(req, res) {

    var db = req.db;
    var query = getQuery(req);
    var collection = db.get('camera');

    var camera = req.body;

    logger.log('debug', '---> delete'); 

    collection.update(req.params.id, {
        $set: {
            "isDeleted": true
        }
    }, function(err) {

        if (err) {
            logger.log('error', err);
        }
        res.json({
            status: err === null ? 'success' : 'failed'
        });
    });
}

/**
 * Get All the cameras
 */
function getCameras(req, res) {

    logger.log('debug', 'getCameras');

    var db = req.db;
    var query = getQuery(req);
    var collection = db.get('camera');

    collection.find({
        isDeleted: {
            $ne: true
        }
    }, function(err, items) {

        if (err) {
            logger.log('error', err);
        }

        res.json({
            status: err === null ? 'success' : 'failed',
            cameras: items
        });

    });

}
/**
 * Get config data
 */
function get(req, res) {

    var db = req.db;
    var query = getQuery(req);
    var collection = db.get('camera');

    if (req.params !== void 0 && req.params.id !== void 0) {
        query['id'] = req.params['id'];
    }

    dbHelper.getFilteredCollection(collection, query, function(err, doc) {

        if (err) {
            logger.log('error', err);
        }

        res.json({
            status: err === null ? 'success' : 'failed',
            config: doc
        });

    });

}
/**
 * save config
 */
router.put('/:id', authorizationHelper, function(req, res) {

    var db = req.db;

    var collection = db.get('camera');

    var camera = req.body;

    if (!req.body) {
        return res.send(400);
    }

    logger.log('debug', camera);

    if(!validateConfigData(camera)){
        
        res.json({
            status: 'failed'
        });

        return;
    }
    //convert 
    camera.imagelog.interval = parseInt(camera.imagelog.interval, 10);
    camera.imagelog.storeDays = parseInt(camera.imagelog.storeDays, 10);
    camera.motionDetect.storeDays = parseInt(camera.motionDetect.storeDays, 10);
    camera.motionDetect.threshold = parseInt(camera.motionDetect.threshold, 10);
    camera.motionDetect.sensitivy = parseInt(camera.motionDetect.sensitivy, 10);
    camera.resolution.x = parseInt(camera.resolution.x, 10);
    camera.resolution.y = parseInt(camera.resolution.y, 10);

    collection.updateById(req.body._id, camera, function(err, doc) {

        if (err) {
            logger.log('error', err);
        }

        res.json({
            status: err === null ? 'success' : 'failed'
        });
    });

});
/**
 * Validate camera object
 * @param  {Camera} camera 
 * @return {Boolean} is attributes valid
 */
function validateConfigData(camera){
    try{
   
        assertEqual(true, validateInterval(camera.imagelog.interval, 1, 86400));
        assertEqual(true, validateInterval(camera.imagelog.storeDays, 1, 3));
        assertEqual(true, validateInterval(camera.motionDetect.storeDays, 1, 3));
        assertEqual(true, validateInterval(camera.motionDetect.threshold, 0, 1920*1080));
        assertEqual(true, validateInterval(camera.motionDetect.sensitivy, 0, Number.MAX_VALUE));
        assertEqual(true, validateInterval(camera.resolution.x, 1, 1920));
        assertEqual(true, validateInterval(camera.resolution.y, 1, 1080));
        assertEqual(true, typeof camera.status === 'boolean');
        assertEqual(true, typeof camera.isDeleted === 'boolean');
        assertEqual(true, typeof camera.imagelog.status === 'boolean');
        assertEqual(true, typeof camera.imagelog.storeImage === 'boolean');
        assertEqual(true, typeof camera.motionDetect.status === 'boolean');
        assertEqual(true, typeof camera.motionDetect.storeImage === 'boolean');  

        return true;
    }catch(e){
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
function validateInterval(value, min, max){
    return  min <= value && value <= max;
}
/**
 * Simple assert
 */
function assertEqual(expected, actual){
    if(expected !== actual){
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