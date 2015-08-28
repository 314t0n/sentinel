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
var config = configs.elte;
var logger = require('./sentinel/logger').app;

var argumentHandler = require('./sentinel/utils/argument-handler');
var db = require('./sentinel/database/middleware');
var mongoProvider = require('./sentinel/database/concrete/mongo')({
    url: config.mongo
});

var sqliteProvider = require('./sentinel/database/concrete/sqlite')({
    fileName: "sentinel"
});

var dbProvider = sqliteProvider;

// Sentinel modules

var socketLogger = require('./sentinel/logger').socket;
var streamer = require('./sentinel/socket/streamer');
var camera = require('./sentinel/socket/camera');
var mdetect = require('./sentinel/socket/motion-detect');


// Bootstrap ---------------------------
//set args in global config object
argumentHandler.setConfig(config);
//global var for templates
app.locals.baseUrl = 'http://' + config.host + ':' + config.port + '/';

// DB connection
app.use(db(dbProvider));

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
        db: dbProvider,
        logger: socketLogger
    })
    .listen(streamer)
    .listen(camera)
    .listen(mdetect);

module.exports = app;