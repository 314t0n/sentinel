var express = require('express');
var router = express.Router();
var url = require('url');

var utils = require('../../utils');
var isUndefined = utils.isUndefined;
var hasKeys = utils.hasKeys;

var dbHelper = require('../../database/helpers/notification-helper');
var mongoHelper = require('../../database/helpers/mongo-helper');

var logger = require('../../logger').app;

var authorizationHelper = require('../../utils').authorizationHelper;

/**
 * Mark All As Read
 * @todo v1.1
 */
router.put('/', authorizationHelper, function(req, res) {

    var db = req.db;
    var data = req.body;

    if (data.markAsRead !== 'all') {
        res.status(400);
        return;
    }

    var update = db.query('notifications').filter({
        'isUnread': true
    }).update({
        'isUnread': false
    });

    update
        .on('success', function() {

            res.sendStatus(200);

        })
        .on('error', errorResponse(res));

});

router.put('/:id', authorizationHelper, function(req, res) {

    var db = req.db;
    var data = req.body;

    var update = db.query('notifications').filter({
        '_id': data._id
    }).update({
        isUnread: data.isUnread
      /*  updated: new Date() missing from sqlite todo */
    });

    update
        .on('success', function() {

            res.sendStatus(200);

        })
        .on('error', errorResponse(res));

});

router.get('/', authorizationHelper, function(req, res) {

    var db = req.db;
    var query = getQuery(req);

    var notifications = db.query('notifications')
        .filter(mongoHelper.getDateFilter(query))
        .filter(mongoHelper.getUnreadFilter(query))
        .filter(mongoHelper.getCameraFilter(query))
        .pagination({
            limit: mongoHelper.getLimitFilter(query),
            skip: mongoHelper.getOffsetFilter(query),
            sort: mongoHelper.getSortFilter(query),
        })
        .all();

    notifications
        .on('success', function(items) {
            res.json({
                notifications: items
            });
        })
        .on('error', errorResponse(res));

});

router.get('/count', authorizationHelper, function(req, res) {

    var db = req.db;
    var query = getQuery(req);

    console.log('count');

    var notifications = db.query('notifications')
        .filter(mongoHelper.getDateFilter(query))
        .filter(mongoHelper.getUnreadFilter(query))
        .filter(mongoHelper.getCameraFilter(query))
        .count();

    notifications
        .on('success', function(value) {
            res.json({
                count: value
            });
        })
        .on('error', errorResponse(res));

});

module.exports = router;

function getQuery(req) {
    var url_parts = url.parse(req.url, true);
    return url_parts.query;
}
//@TODO
function errorHandler(err) {

    if (err) {
        logger.log('error', err);
    }

}
//@TODO
function errorResponse(res) {
    return function(err) {
        logger.log("error", err);
        res.sendStatus(500);
    }
}