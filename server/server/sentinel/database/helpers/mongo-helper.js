/**
 * Module dependencies
 */
var hasKeys = require('../../utils').hasKeys;
var logger = require('../../logger').app;
var extend = require('extend');

function setLimit(query) {
    return function(collection) {
        if (hasKeys(query, ['limit', 'offset'])) {

            var limit = parseInt(query.limit, 10);
            var offset = parseInt(query.offset, 10);

            collection.skip(offset * limit, function(err, items) {
                if (err) throw err;
                items.limit(limit, function(err, items) {
                    if (err) throw err;

                    return items;
                });
            });

        }

        return collection;

    }
}

function setSortType(query) {
    return function(collection) {
        if (hasKeys(query, ['sortType'])) {
            collection = collection.sort({
                'date': getSortType(query)
            });
        }
        return collection;
    }
}

function getSortType(query) {

    return query.sortType === 'DESC' ? -1 : 1;

}

function setDateFilter(query) {
    return function(collection) {

        if (hasKeys(query, ['from', 'to'])) {

            var filter = {
                'date': {
                    '$gte': new Date(query.from),
                    '$lte': new Date(query.to)
                }
            };

            //todo refactor
            if (hasKeys(query, ['id'])) {
                filter['cam'] = query.id;
            }

            collection = collection.find(filter);

        } else {

            collection = collection.find({});

        }

        return collection;

    }
}

function getUnreadFilter(query) {
    if (hasKeys(query, ['unread'])) {

        return {
            'isUnread': true
        }

    } else {

        return {};

    }
}

function getCameraFilter(query) {
    if (hasKeys(query, ['name'])) {

        return {
            'cam': query.name
        }

    } else {

        return {};

    }
}

function getDateFilter(query) {
    if (hasKeys(query, ['from', 'to'])) {

        return {
            'date': {
                '$gte': new Date(query.from),
                '$lte': new Date(query.to)
            }
        }

    } else {

        return {};

    }
}

function getSortFilter(query) {
    if (hasKeys(query, ['sortType'])) {
        return {
            'date': getSortType(query)
        }
    }
}

function getLimitFilter(query) {
    if (hasKeys(query, ['limit'])) {
        var limit = parseInt(query.limit, 10);
        return limit;
    }
    return null;
}

function getOffsetFilter(query) {
    if (hasKeys(query, ['offset'])) {
        var limit = query.limit || 1;
        var offset = parseInt(query.offset, 10);
        return offset * limit
    }
    return null;
}

function filterCollection(collection, query, fn) {

    logger.log('debug', 'filterCollection');

    var conditions = {
        limit: getLimitFilter(query),
        skip: getOffsetFilter(query),
        sort: getSortFilter(query),
    }

    var dateFilter = getDateFilter(query);
    var unreadFilter = getUnreadFilter(query);
    var cameraFilter = getCameraFilter(query);

    var filter = extend(dateFilter, cameraFilter, unreadFilter);
    
    collection.find(filter, conditions, fn);

}

function countCollection(collection, query, fn) {

   /* logger.log('debug', 'countCollection');*/

    var dateFilter = getDateFilter(query);
    var unreadFilter = getUnreadFilter(query);
    var cameraFilter = getCameraFilter(query);

    var filter = extend(dateFilter, cameraFilter, unreadFilter);

    collection.count(filter, fn);

}

exports.filterCollection = filterCollection;
exports.countCollection = countCollection;
exports.setDateFilter = setDateFilter;
exports.getSortType = getSortType;
exports.setSortType = setSortType;
exports.getDateFilter = getDateFilter;
exports.getUnreadFilter = getUnreadFilter;
exports.getCameraFilter = getCameraFilter;
exports.getLimitFilter = getLimitFilter;
exports.getOffsetFilter = getOffsetFilter;
exports.getSortFilter = getSortFilter;
exports.setLimit = setLimit;