var express = require('express');
var router = express.Router();
var url = require('url');

var utils = require('../../utils');
var isUndefined = utils.isUndefined;
var hasKeys = utils.hasKeys;

var dbHelper = require('../../database/notification-helper');

var logger = require('../../logger').app;

var authorizationHelper = require('../../utils').authorizationHelper;

/**
 * Mark All As Read
 *
 */
router.put('/', authorizationHelper, function(req, res) {

    var db = req.db;
    var data = req.body;

    if (data.markAsRead !== 'all') {
        res.status(400);
        return;
    }

    var collection = db.get('notifications');

    dbHelper.filter(collection, {
        isUnread: true
    }, function(err, items) {

        errorHandler(err);

        items.forEach(function(notification) {
            notification.isUnread = false;
            dbHelper.update(db, notification, function(err, items) {

                errorHandler(err);

            });

        });

        res.json({
            status: err === null ? 'success' : 'failed'
        });

    });


});

router.put('/:id', authorizationHelper, function(req, res) {

    var db = req.db;
    var data = req.body;

    logger.log('debug', 'put');

    dbHelper.update(db, data, function(err, items) {

        errorHandler(err);

        res.json({
            status: err === null ? 'success' : 'failed'
        });

    });

});

router.get('/', authorizationHelper, function(req, res) {

    var db = req.db;
    var query = getQuery(req);

    var collection = db.get('notifications');

    dbHelper.filter(collection, query, function(err, items) {

        errorHandler(err);

        res.json({
            status: err === null ? 'success' : 'failed',
            notifications: items
        });

    });

});

router.get('/count', authorizationHelper, function(req, res) {

    var db = req.db;
    var query = getQuery(req);
    var collection = db.get('notifications');

    dbHelper.count(collection, query, function(err, count) {

        errorHandler(err);

        res.json({
            status: err === null ? 'success' : 'failed',
            count: count
        });
    });

});

module.exports = router;

function getQuery(req) {
    var url_parts = url.parse(req.url, true);
    return url_parts.query;
}

function errorHandler(err) {

    if (err) {
        logger.log('error', err);
    }

}