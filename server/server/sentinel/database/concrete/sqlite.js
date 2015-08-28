/**
 * Module dependencies
 */
var _ = require('underscore');
var Promise = require('mpromise');
var dblite = require('dblite').withSQLite('3.8.6+');
var logger = require('../../logger').app;
/**
 * Module compatibility
 */
Promise.SUCCESS = 'success';
Promise.FAILURE = 'error';

// Global Helper functions

/**
 * http://stackoverflow.com/questions/3710204/how-to-check-if-a-string-is-a-valid-json-string-in-javascript-without-using-try
 * @param {Boolean} str
 */
function isJsonString(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}

/**
 * Module definition
 * @param  {Object} opt options
 * @return {SqliteProvider}
 */
module.exports = function(opt) {

    if (_.isUndefined(opt.fileName)) {

        throw new Error('options.fileName is not defined!');

    }
    /**
     * Creates new instance
     * @return {Database}
     */
    function getInstance() {

        return dblite(opt.fileName);

    }

    var sqliteProvider = {};
    /**
     * [get description]
     * @param  {[type]}   collectionName [description]
     * @param  {[type]}   obj            [description]
     * @param  {Function} fn             [description]
     * @return {[type]}                  [description]
     */
    sqliteProvider.get = function get(collectionName, obj, fn) {

        var promise = new Promise(this);

        var db = getInstance();

        var query = "SELECT * FROM " + _escape(collectionName);

        var params = [];

        if (!_.isUndefined(obj)) {

            query += " ";
            query += _getWhere(obj);
            params = _.toArray(obj);

        }

        db.query(query, params,
            function(err, result) {

                _errorHandler(err, promise, collectionName);

                promise.fulfill(_applyFn(result, fn));

                db.close();
            });

        return promise;

    }
    /**
     * [save description]
     * @param  {[type]} collectionName [description]
     * @param  {[type]} obj            [description]
     * @return {[type]}                [description]
     */
    sqliteProvider.save = function save(collectionName, obj) {

        var promise = new Promise(this);

        var db = getInstance();

        var keys = Object.keys(obj);
        //generate array of qm with size of props 
        var questionMarks = keys.map(function() {
            return "?";
        }).join(",");
        //
        if (_.isUndefined(obj._id)) {
            questionMarks += ", ?";
        }
        //plus one qm for obj._id
        var query = "INSERT OR REPLACE INTO  " + _escape(collectionName) + " VALUES (" + questionMarks + ");"
            //query params
        var params = [];
        //first key must be identifier or null
        if (_.isUndefined(obj._id)) {
            params.push(null);
        }
        //@TODO what if parameter order different? 
        params = params.concat(_.toArray(obj));

        db.query(query, params,
            function(err, result) {

                if (err) {
                    logger.log('error', err, collectionName);
                    promise.reject(err);
                }
                //todo
                if (typeof fn === 'function') {
                    result = fn(result);
                }
                //update obj id
                if (obj._id === null) {
                    db.lastRowID(collectionName, function(rowid) {
                        obj._id = rowid;
                    });
                }

                promise.fulfill(result);
                db.close();
            });

        return promise;

    }
    //todo ne csak id alapján!
    sqliteProvider.remove = function save(collectionName, obj) {

        var promise = new Promise(this);

        var db = getInstance();

        var query = "DELETE FROM " + _escape(collectionName) + " " + _getWhere(obj);

        var params = _.toArray(obj);

        console.log(params);

        db.query(query, params,
            function(err, result) {

                _errorHandler(err, promise, collectionName);

                if (typeof fn === 'function') {
                    result = fn(result);
                }

                promise.fulfill(result);
                db.close();
            });

        return promise;

    }
    //@TODO remove plz
    var update = function update(collectionName, obj, options) {

            var execute = function(query, params) {

                var promise = new Promise(this);

                var db = getInstance();

                db.query(query, params,
                    function(err, result) {

                        _errorHandler(err, promise, collectionName);

                        promise.fulfill(result);

                        db.close();
                    });


                return promise;

            }

            return updateQueries[collectionName].call(null, obj, execute, options);

        }
        //ehh
    sqliteProvider.update = update;
    sqliteProvider.updateById = update;
    /**
     * todo deprecated
     * @type {Object}
     */
    var updateQueries = {

        camera: function(obj, execute) {

            var sql = "UPDATE camera SET name = ?, status = ?, isDeleted = ?, imagelog = ?, motionDetect = ?, resolution = ?, fps = ? WHERE _id = ? ";
            var params = [
                obj.name,
                obj.status,
                obj.isDeleted,
                JSON.stringify(obj.imagelog),
                JSON.stringify(obj.motionDetect),
                JSON.stringify(obj.resolution),
                obj.fps,
                obj._id
            ];

            return execute(sql, params);

        },
        notifications: function(obj, execute, filter) {

            var sql = "";
            //var query = "UPDATE notifications SET isUnread = ? WHERE _id = ? ";
            var query = "UPDATE notifications " + _getUpdateParameters(obj) + _getWhere(filter);
            var params = [];

            console.log(query);

            function appendQuery(notification) {
                /*  sql += query;
                sql += '; ';*/
                params.push(notification.isUnread);
                params.push(notification._id);
            }

            if (typeof obj === 'array') {

                _.each(obj, function(current) {
                    appendQuery(current);
                });

            } else {
                appendQuery(obj);
            }

            return execute(sql);

        },

    };
    /**
     * Escaping string
     * @param  {String} str
     * @return {String}
     */
    function _escape(str) {

        return str.replace(/[\\"']/g, '\\$&').replace(/\u0000/g, '\\0');

    }
    /**
     * Apply given function to the given object
     * @param  {[type]}   result [description]
     * @param  {Function} fn     [description]
     * @return {[type]}          [description]
     */
    function _applyFn(result, fn) {
        if (typeof fn === 'function') {
            return fn(result);
        }
        return result;
    }
    /**
     * Common error handling
     * @param  {Object} err            Db error object or null
     * @param  {Object} promise        Promise that should be rejected if error occured
     * @param  {String} collectionName Table name where the error occured
     * @param  {Object} db             For closing the connection
     * @return {Boolean}               whether if error happened
     */
    function _errorHandler(err, promise, collectionName, db) {
        if (err) {
            logger.log('error', err, collectionName);
            promise.reject(err);
            db.close();
            return true;
        }
        return false;
    }
    /**
     * Generate SET attributes for UPDATE command
     * ex.: {a:1, b:2} => SET a=1, b=2
     * @param {Object} obj
     * @return {String}
     */
    function _getUpdateParameters(obj) {

        if (!_.isObject(obj) || Object.keys(obj).length === 0) {
            return "";
        }

        var resp = " SET ";

        var keys = _.map(obj, function(val, key) {

            return _escape(key) + ' = ?';

        });

        resp += keys.join(" , ");

        return resp;
    }
    /**    
     * Generates WHERE string from key value pairs
     *
     * Todo: OR
     *
     * @param  {Object} filter key value pairs
     * @return {String}        WHERE a=1 AND b=1 ...
     */
    function _getWhere(filter) {

        if (!_.isObject(filter) || Object.keys(filter).length === 0) {
            return "";
        }

        var resp = " WHERE ";

        var keys = _.map(filter, function(val, key) {

            if (typeof val === "object") {

                var clause = Object.keys(val).map(function(operator) {

                    return _escape(key) + _getOperator(operator) + ' ? ';

                });


                return " ( " + clause.join(" AND ") + " ) ";

            } else {

                return _escape(key) + _getOperator(val) + ' ? ';

            }
        });

        resp += keys.join(" AND ");

        return resp;
    }

    /**
     * Convert string to object if it's json string
     * @param  {Object} result
     * @return {Void}
     */
    function convertJSON(result) {
        _.each(result, function(val, key) {
            if (isJsonString(val)) {
                result[key] = JSON.parse(val);
            }
        });
    }
    /**
     * Operator shortnames
     * @param  {[type]} val [description]
     * @return {[type]}     [description]
     */
    function _getOperator(val) {
        var op = ' = ';
        switch (val) {
            case '$ne':
                op = ' != ';
                break;
            case '$gte':
                op = ' >= ';
                break;
            case '$lte':
                op = ' <= ';
                break;
        }

        return op;
    }
    /**
     * Creates sqlite compatible parameter array
     * @return {Array} filter values or empty array
     */
    function _getFilterValues(obj) {

        if (Object.keys(obj).length > 0) {

            return _.flatten(_.map(obj, function(val, key) {
                //nested filter object ...
                if (typeof val === 'object') {
                    return _.map(val, function(nestedValue) {
                        return nestedValue;
                    });
                }
                return val;
            }));

        }
        return null;
    }
    /**
     * [_getUpdateValues description]
     * @param  {[type]} obj [description]
     * @return {[type]}     [description]
     */
    function _getUpdateValues(obj) {

        if (Object.keys(obj).length > 0) {

            return _.flatten(_.map(obj, function(val, key) {
                //nested filter object ...
                if (typeof val === 'object') {
                    return JSON.stringify(val);
                }
                return val;
            }));

        }
        return null;
    }
    /**
     * Checks whether the object conatins a given key
     * @param  {Object} obj
     * @param  {String} key
     * @return {Boolean}
     */
    function _haskKey(obj, key) {

        return !_.isUndefined(_.findKey((obj, key)))

    }
    /**
     * Generates LIMIT string
     * @param  {Object} pagination contains pagination data
     * @return {String}
     */
    function _getLimit(pagination) {

        var keys = _.keys(pagination);

        function _hasKey(key) {
            return keys.indexOf(key) > -1;
        }

        function getSortValues() {

            if (typeof pagination.sort === 'object') {
                //@todo
                return _.map(pagination.sort, function(v, k) {
                    var s = v > 0 ? 'ASC' : 'DESC';
                    return _escape(k) + ' ' + s;
                })[0];

            }

            return pagination.sort;
        }

        var resp = ' ';

        if (keys.length > 0) {

            if (_hasKey('sort')) {
                resp += 'ORDER BY ' + getSortValues();
            }

            if (_hasKey('limit')) {

                resp += ' LIMIT ';

                if (_hasKey('skip')) {
                    resp += _escape(pagination.skip.toString());
                    resp += ', ';
                }

                resp += _escape(pagination.limit.toString());

            }
        }

        return resp;
    }
    /**
     * 
     * @return {[type]} [description]
     */
    function _getQueryParameters(filter, updateParams) {

        // update set attributes
        var updateParams = _getUpdateValues(updateParams) || [];
        //where values
        var filter = _getFilterValues(filter) || [];
        //join params
        var parameters = updateParams.concat(filter);

        if (parameters.length === 0) {
            parameters = null; // required by the sqlite library
        }

        return parameters;

    }

    sqliteProvider.query = function query(collectionName) {

        var _filter = {}; // where attributes
        var _updateParams = {}; // update attributes
        var _pagination = {}; // limit, offset

        var db = getInstance();
        /**
         * Executing current query
         *
         * @param  {String}   query database query
         * @param  {Function} cb    applied to the results
         * @return {Promise}
         */
        function _execute(query, cb) {

            /*logger.log('debug', query);*/

            var promise = new Promise(this);

            var params = _getQueryParameters(_filter, _updateParams);

            db
                .query('.headers ON')
                .query(query, params,
                    function(err, result) {
                        // closes db, reject promise, log error
                        if (_errorHandler(err, promise, collectionName)) {
                            return;
                        }
                        //convert json string properties to object
                        _.each(result, function(val) {
                            convertJSON(val);
                        });
                        //apply cb
                        promise.fulfill(_applyFn(result, cb));
                        db.close();
                    });

            return promise;
        }

        // api
        return {

            all: function all(fn) {
                var statement = "SELECT * FROM " + _escape(collectionName) + _getWhere(_filter) + _getLimit(_pagination);
                return _execute(statement);
            },

            count: function count(fn) {
                var statement = "SELECT COUNT(*) as count FROM " + _escape(collectionName) + _getWhere(_filter);
                return _execute(statement, function(result) {
                    return result[0].count;
                });
            },

            filter: function filter(filter) {
                if (filter.hasOwnProperty('date')) {
                    //todo
                }
                _filter = _.extend(_filter, filter);
                return this;
            },

            first: function first(fn) {
                var statement = "SELECT * FROM " + _escape(collectionName) + _getWhere(_filter) + _getLimit(_pagination);
                /*logger.log('debug', statement);*/
                return _execute(statement, function(result) {
                    return _.first(result);
                });
            },

            pagination: function pagination(pagination) {
                _pagination = _.extend(_pagination, pagination);
                return this;
            },

            update: function(obj, fn) {
                _updateParams = _.extend(_updateParams, obj);
                var statement = "UPDATE " + _escape(collectionName) + " " + _getUpdateParameters(obj) + _getWhere(_filter);
                return _execute(statement, fn);
            }
        }

    }

    return sqliteProvider;

}