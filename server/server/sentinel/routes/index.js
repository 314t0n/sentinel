var express = require('express');
var router = express.Router();
var logger = require('../logger').app;

var baseUrl =  'http://sentinel:3000/';

/* GET home page. */
router.get('/', function(req, res) {	

    res.render('index', {
        'title': 'Sentinel',
        'baseUrl':baseUrl
    });
});

router.setBaseUrl = function(url){
	baseUrl = url;
}

module.exports = router;
