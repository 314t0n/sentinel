#!/usr/bin/env node

var debug = require('winston');
var app = require('../server/app');

/*app.use(function(req, res, next) {

    var user = auth(req);

    console.log('user' , user)    

    if (!user || !admins[user.name] || admins[user.name].password !== user.pass) {
        res.statusCode = 401;
        res.setHeader('WWW-Authenticate', 'Basic realm="yo"');
        res.end('Unauthorized');
    } else {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST', 'PUT', 'DELETE');
        res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Authorization');
        next();
    }

});*/