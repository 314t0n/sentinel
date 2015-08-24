var express = require('express');
var router = express.Router();

var authorizationHelper = require('../utils').authorizationHelper;

router.get('/404', function(req, res) {
    res.render('partials/404');
});

router.get('/login', function(req, res) {
    res.render('partials/login');
});

router.get('/:name', authorizationHelper, function(req, res) {
    var name = req.params.name;
    res.render('partials/' + name);
});

module.exports = router;