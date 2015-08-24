var express = require('express');
var router = express.Router();
var url = require('url');

var utils = require('../../utils');
var filteredCollection = utils.filteredCollection;
var setDateFilter = utils.setDateFilter;
var isUndefined = utils.isUndefined;
var hasKeys = utils.hasKeys;

var logger = require('../../logger').app;

var client = require('../../database/elasticsearch').client;
var dbHelper = require('../../database/imagelog-helper');

var authorizationHelper = require('../../utils').authorizationHelper;

function formatResponse(hits) {
    return hits.map(function(elem) {
        return {
            cam: elem._source.cam,
            image: elem._source.image,
            date: elem._source.log_date,
            title: elem._source.title
        };
    });
}

router.get('/', authorizationHelper, function(req, res) {
 
    var query = getQuery(req);

    var body = dbHelper.getBody(query);

    logger.log('debug', body);
    logger.log('debug', query.limit);
    logger.log('debug', query.offset);

    client.search({
        index: 'imagelogs',
        size: query.limit,
        from: query.offset,
        body: body

    }).then(function(resp) {
        var hits = resp.hits.hits;
        /*logger.log('debug', resp);*/
        res.json({
            imagelogs: formatResponse(hits),
            count: resp.hits.total
        })
    }, function(err) {
        logger.log('error', err.message);
    });


});


module.exports = router;

function getQuery(req) {
    var url_parts = url.parse(req.url, true);
    return url_parts.query;
}