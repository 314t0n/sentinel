var Promise = require('bluebird');
var utils = require('../../utils');
var isUndefined = utils.isUndefined;
var hasKeys = utils.hasKeys;
var logger = require('../../logger').app;

var getFilteredCollection = function getFilteredCollection(collection, query, fn) {

    var firstOrDefault = getFirstOrDefault(collection, query);

    var config = {};

    Promise.settle([firstOrDefault]).then(function(results) {

        results.forEach(function(result) {
            if (!result.isFulfilled()) {
                logger.log('error', result.reason());
                fn(result.reason(), null);
            }
        });

        config.camera = results[0].value();    

        fn(null, config);

    });
}

var getFirstOrDefault = function getFirstOrDefault(collection, query) {

    if (hasKeys(query, ['id'])) {

        return collection.findOne({
            'name': query.id
        });

    } else {

        return collection.findOne({});

    }
}

exports.getFilteredCollection = getFilteredCollection;