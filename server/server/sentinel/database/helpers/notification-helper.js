var mongoHelper = require('./mongo-helper');

var logger = require('../../logger').app;
/**
 * Get filtered elements
 * @param  {[type]}   collection [description]
 * @param  {[type]}   query      [description]
 * @param  {Function} fn         [description]
 * @return {[type]}              [description]
 */
function filter(collection, query, fn) {
    return mongoHelper.filterCollection(collection, query, fn);
}
/**
 * Update current item's isUnread property
 * @param  {[type]}   db   [description]
 * @param  {[type]}   item [description]
 * @param  {Function} fn   [description]
 * @return {[type]}        [description]
 */
function update(db, item, fn) {

    db.get('notifications').update({
        _id: item._id
    }, {
        $set: {
            isUnread: item.isUnread,
            updated: new Date()        
        }
    }, function(err, doc) {

        if (err) logger.log('error', err);

        if (typeof fn === 'function') {
            fn(err, doc);
        }

    });
}
/**
 * Persist notification
 * @param {Mongo/Monk}     db     db driver
 * @param {Notification}   item   insertion data
 * @param {Function}       fn     callback
 */
function add(db, item, fn) {

    db.get('notifications').insert(item, function(err, doc) {

        if (err) logger.log('error', err);

        if (typeof fn === 'function') {
            fn(err, doc);
        }

    });

}
/**
 * Get elements with filters applied
 *  @deprecated
 */
function get(collection, query) {

    return mongoHelper.filteredCollection(collection)
        .setDateFilter(query)
        .setSortType(query)
        .setLimit(query)
        .getCollection();

}
/**
 * Number of notifications
 * @param  {Notifications}   collection Database object
 * @param  {Object}   query             Query params
 * @param  {Function} fn                callback
 * @return {Number}                     #elements
 */
function count(collection, query, fn) {
    return mongoHelper.countCollection(collection, query, fn);
}

exports.filter = filter;
exports.add = add;
exports.get = get;
exports.count = count;
exports.update = update;