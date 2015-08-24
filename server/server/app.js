// Basic modules

var express = require('express');
var app = express();
var http = require('http').Server(app);
var path = require('path');
var favicon = require('serve-favicon');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var auth = require('basic-auth');
var configs = require('./sentinel/config');
var utils = require('./sentinel/utils');
//default
var config = configs.dev;
var logger = require('./sentinel/logger').app;

process.argv.forEach(function(val, index, array) {

    if (val[0] === '-') {

        var arg = val.split('=');

        if (arg[0] === '-ip') {
            config.host = arg[1];
            logger.log('info', 'set ip: %s', config.host);
        }

        if (arg[0] === '-port') {
            config.port = arg[1];
            logger.log('info', 'set port: %s', config.port);
        }

        if (arg[0] === '-env') {

            var env = arg[1];

            logger.log('info', 'set enviroment: %s', env);
      
            if (utils.hasKeys(configs, [env])) {
                config = configs[env];
            } else {
                logger.log('warn', 'no such an enviroment: %s, using dev', env);
            }
        }

    }

});

// Sentinel modules

var socketLogger = require('./sentinel/logger').socket;
var streamer = require('./sentinel/socket/streamer');
var camera = require('./sentinel/socket/camera');
var mdetect = require('./sentinel/socket/motion-detect');

// Database

var db = require('monk')(config.mongo);

app.locals.baseUrl = 'http://' + config.host + ':' + config.port + '/';

// DB connection

app.use(function(req, res, next) {
    req.db = db;
    next();
});

// View engine setup

app.set('views', path.join(__dirname, '../public/views'));
app.set('view engine', 'jade');
app.set('view cache', 'disable');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(cookieParser());

// Public folders

app.use(express.static(path.join(__dirname, '../public')));
app.use('/bower_components', express.static(path.join(__dirname, '../bower_components')));
app.use('/js/bower', express.static(path.join(__dirname, '../bower_components')));

// For testing only

var admins = {
    'x': {
        password: 'x'
    },
    'hajnaldavid@elte.hu': {
        password: 'almafa1'
    }
};

// Header settings

app.use(function(req, res, next) {

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Authorization');
    next();

});

module.exports = app;

// Router

var indexRoute = require('./sentinel/routes/index');
var partialsRoute = require('./sentinel/routes/partials');
var authRoute = require('./sentinel/routes/auth');
var imagelogRoute = require('./sentinel/routes/api/imagelog');
var notificationRoute = require('./sentinel/routes/api/notification');
var configRoute = require('./sentinel/routes/api/config');

// Api routing

app.use('/api/v1/imagelog', imagelogRoute);
app.use('/api/v1/notification', notificationRoute);
app.use('/api/v1/config', configRoute);
app.use('/api/v1/auth', authRoute);

// partials

app.use('/partials', partialsRoute);

// catch everything else

indexRoute.setBaseUrl("http://" + config.host + ":" + config.port + "/");

app.use('*', indexRoute);

// catch 404 and forward to error handler

app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

app.set('port', process.env.PORT || config.port);

process.on('uncaughtException', function(err) {
    logger.log("error", err);
});

var server = app.listen(app.get('port'), config.host, function() {
    logger.log('info', 'Express server listening on port ' + server.address().port);
});

var sockets = require('./sentinel/socket.app');

sockets
    .start({
        config: config,
        server: server,
        db: db,
        logger: socketLogger
    })
    .listen(streamer)
    .listen(camera)
    .listen(mdetect);

module.exports = app;