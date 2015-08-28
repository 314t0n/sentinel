var client = require('../concrete/elasticsearch').client;
var logger = require('../../logger').app;
var utils = require('../../utils');
var hasKeys = utils.hasKeys;

function add(imagelog) {
    
    client.create({
        index: 'imagelogs',
        type: 'imagelog',
        body: {
            title: imagelog.title,
            image: imagelog.image,
            published: true,
            published_at: new Date(),
            log_date: new Date(imagelog.date),
            cam: imagelog.cam
        }
    }, function(error, response) {
        if (error) {
            logger.log('error', "Error persisting data: %s %s", error, response);
        }
    });

}

function getDateFilter(query) {

    var camera = query.name || '*';

    if (camera === '*') {
        return {

            "filtered": {
                "query": {
                    "match_all": {}
                },
                "filter": {
                    "and": [{
                        "range": {
                            "log_date": {
                                "gte": new Date(query.from),
                                "lte": new Date(query.to)
                            }
                        }
                    }]
                }
            }
        }

    } else {

        return {
            "filtered": {
                "query": {
                    "match_all": {}
                },
                "filter": {
                    "and": [{
                        "range": {
                            "log_date": {
                                "gte": new Date(query.from),
                                "lte": new Date(query.to)
                            }
                        }
                    }, {
                        "term": {
                            "cam": camera.toLowerCase()
                        }
                    }]
                }
            }

        };

    }

}

function getBody(query) {

    var body = {};

    body['sort'] = [{
        'log_date': {
            'order': 'desc'
        }
    }];

    if (hasKeys(query, ['from', 'to'])) {

        body['query'] = getDateFilter(query);

    } else if (hasKeys(query, ['name'])) {

        body['query'] = {
            "filtered": {
                "filter": {
                    "term": {
                        "cam": query['name'].toLowerCase()
                    }
                }
            }
        };

    } else {

        body['query'] = {
            "match_all": {}
        };

    }

    return body;

}

exports.add = add;
exports.getDateFilter = getDateFilter;
exports.getBody = getBody;