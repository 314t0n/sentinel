var express = require('express');
var router = express.Router();
var url = require('url');

var utils = require('../../utils');
var filteredCollection = utils.filteredCollection;
var setDateFilter = utils.setDateFilter;
var isUndefined = utils.isUndefined;
var hasKeys = utils.hasKeys;

var logger = require('../../logger').app;
/*
var client = require('../../database/elasticsearch').client;*/
var dbHelper = require('../../database/helpers/imagelog-helper');
var mongoHelper = require('../../database/helpers/mongo-helper');

var authorizationHelper = require('../../utils').authorizationHelper;
//legacy @todo move to elastic dao
/*function formatResponse(hits) {
    return hits.map(function(elem) {
        return {
            cam: elem._source.cam,
            image: elem._source.image,
            date: elem._source.log_date,
            title: elem._source.title
        };
    });
}

    client.search({
        index: 'imagelogs',
        size: query.limit,
        from: query.offset,
        body: body

    }).then(function(resp) {
        var hits = resp.hits.hits;
        /*logger.log('debug', resp);*/
/*        res.json({
            imagelogs: formatResponse(hits),
            count: resp.hits.total
        })
    }, function(err) {
        logger.log('error', err.message);
    });*/

router.get('/', authorizationHelper, function(req, res) {

    var db = req.elastic || req.db;
 
    var query = getQuery(req);

    var imagelogs = db.query('imagelogs')
        .filter(mongoHelper.getDateFilter(query))
        .filter(mongoHelper.getUnreadFilter(query))
        .filter(mongoHelper.getCameraFilter(query))
        .pagination({
            limit: mongoHelper.getLimitFilter(query),
            skip: mongoHelper.getOffsetFilter(query),
            sort: mongoHelper.getSortFilter(query),
        })
        .all();

    imagelogs
        .on('success', function(items) {         
            res.json({
                imagelogs: items
            });
        });

});

router.get('/count', authorizationHelper, function(req, res) {

    var db = req.elastic || req.db;
 
    var query = getQuery(req);

    var imagelogs = db.query('imagelogs')
        .filter(mongoHelper.getDateFilter(query))
        .filter(mongoHelper.getUnreadFilter(query))
        .filter(mongoHelper.getCameraFilter(query))
        .pagination({
            limit: mongoHelper.getLimitFilter(query),
            skip: mongoHelper.getOffsetFilter(query),
            sort: mongoHelper.getSortFilter(query),
        })
        .count();

    imagelogs
        .on('success', function(items) {         
            res.json({
                count: items
            });
        });

});


module.exports = router;

function getQuery(req) {
    var url_parts = url.parse(req.url, true);
    return url_parts.query;
}