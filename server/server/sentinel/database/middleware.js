var databaseInterface = require('./abstract/database');
var _ = require('underscore');

// the middleware function
module.exports = function(provider) {
    //add default interface methods
    provider = _.defaults(provider, databaseInterface);

    return function(req, res, next) {
        req.db = provider;
        next();
    }

};