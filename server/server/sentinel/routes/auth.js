var express = require('express');
var router = express.Router();
var bcrypt = require('bcrypt-nodejs');
var jwt = require('jsonwebtoken');
var url = require('url');

var logger = require('../logger').app;

var authorizationHelper = require('../utils').authorizationHelper;

/**
 * authorizationHelper error messages
 */
function errorResponse(res) {

    return function(err) {
        logger.log("error", err);

        res.json({
            status: "error",
            data: "Error occured: " + err
        });
    }

}

/**
 * Response with token
 * @param  {res router response object}
 * @return {void}     401 or token
 */
function loginResponse(res, user) {

    var token = jwt.sign({
        email: user.email
    }, 'secret', {
        expiresInMinutes: 5000
    });

    delete user.password;

    res.json({
        status: 'success',
        user: user,
        token: token
    });

}

/**
 * Handling password auth
 * @param  {router} req
 * @param  {router} res
 * @return {void}       401 or token
 */
function loginHandler(req, res) {

    return function(user) {

        if (user) {

            console.log(user);

            bcrypt.compare(req.body.password, user.password, function(err, isPassed) {

                console.log(isPassed);
                if (isPassed) {

                    loginResponse(res, user);

                } else {

                    res.sendStatus(401);

                }

            });

        } else {

            res.sendStatus(401);

        }

    }

}

/**
 * Standard email/pass login
 */
router.post('/login', function(req, res) {

    var db = req.db;

    var query = db.query('users').filter({
            email: String(req.body.email)
        }).first();

    query
        .on('success', loginHandler(req, res))
        .on('error', errorResponse(res));

});

router.post('/authenticate', authorizationHelper, function(req, res) {

    var decode = jwt.verify(req.token, 'secret', function(err, decoded) {

        if (err !== null) {
            res.sendStatus(403);
            return;
        }

        var db = req.db;

        var query = db.query('users').filter({
            email: decoded.email
        }).first();

        query
            .on('success', function(user) {

                logger.log('debug', '[%s] successfully logged in!', user.email);
                sendUserData(res, user);

            })
            .on('error', errorResponse(res));

    });

});

function sendUserData(res, user) {
    delete user.password;

    res.json({
        status: 'success',
        user: user
    });

}

// access endpoint
//@TODO it's the same??
router.get('/me', authorizationHelper, function(req, res) {

    var decode = jwt.verify(req.token, 'secret', function(err, decoded) {

        if (err !== null)
            res.sendStatus(403);

        var db = req.db;

        var query = db.query('users').filter({
            email: decoded.email
        }).first();

        query
            .on('success', function(user) {

                logger.log('debug', '[%s] successfully logged in!', user.email);
                sendUserData(res, user);

            })
            .on('error', errorResponse(res));
  
    });

});
//@TODO
router.put('/me', authorizationHelper, function(req, res) {

    var decode = jwt.verify(req.token, 'secret', function(err, decoded) {

        if (err !== null)
            res.sendStatus(403);

        var db = req.db;

        var users = db.get("users");

        var data = getQuery(req);

        users
            .findOne({
                email: decoded.email
            })
            .on('success', function(user) {

                var devices = user.devices || {};
                devices[data.uuid] = data.value == 'true';

                users.update({
                        _id: user._id
                    }, {
                        $set: {
                            'devices': devices
                        }
                    },
                    function(err, doc) {

                        if (err) logger.log('error', err);
                        res.sendStatus(200);

                    });

            })
            .on('error', errorResponse(res));
    });

});


function getQuery(req) {
    var url_parts = url.parse(req.url, true);
    return url_parts.query;
}

module.exports = router;