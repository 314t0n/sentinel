/**
 * Module dependencies
 */
var _ = require('underscore');
var mongoHelper = require('../helpers/mongo-helper');
var monk = require('monk');

/**
 * Module definition
 * @param  {Object} opt options
 * @return {MongoProvider}
 */
module.exports = function(opt) {

    if (_.isUndefined(opt.url)) {
        throw new Error('options.url is not defined!');
    }

    var db = monk(opt.url);

    var mongoProvider = {};

    mongoProvider.get = function get(collectionName, query) {
        return db.get(collectionName);
    }

    mongoProvider.save = function save(collectionName, obj) {
        return db.get(collectionName).insert(obj);
    }
    //@TODO check
    mongoProvider.update = function update(collectionName, obj, options) {
        return db.get(collectionName).updateById(obj._id, obj, options);
    }

    mongoProvider.updateById = function update(collectionName, obj, id, options) {
        return db.get(collectionName).updateById(id, obj, options);
    }

    mongoProvider.remove = function remove(collectionName, query) {
        return db.get(collectionName).remove(query);
    }

    mongoProvider.query = function query(collectionName) {

        var _collection = db.get(collectionName);
        var _filter = {};
        var _pagination = {};

        return {

            all: function all(fn) {
                return _collection.find(_filter, _pagination, fn);
            },

            count: function count(fn) {
                return _collection.count(_filter, fn);
            },

            filter: function filter(filter) {
                _filter = _.extend(_filter, filter);
                return this;
            },

            first: function first(fn) {
                return _collection.findOne(_filter, fn);
            },

            pagination: function pagination(pagination) {
                _pagination = _.extend(_pagination, pagination);
                return this;
            }
        }

    }

    return mongoProvider;


}