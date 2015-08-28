var winston = require('winston');

winston.addColors({
    trace: 'magenta',
    input: 'grey',
    verbose: 'cyan',
    debug: 'grey',
    info: 'cyan',
    warn: 'yellow',
    error: 'red'
  });

var app = new(winston.Logger)({
    transports: [
        new(winston.transports.Console)({
           /* handleExceptions: true,*/
            level: 'silly',
            label: "Sentinel.App",
            timestamp: true,
            colorize: true,
            prettyPrint: true            
        }),
        new(winston.transports.File)({
            name: 'error-file',
            filename: 'logs/streamer-error.log',
            level: 'error',
            label: "Sentinel.App",
            timestamp: false,
        })
    ]
});

var socket = new(winston.Logger)({
    transports: [
        new(winston.transports.Console)({
            level: 'debug',
            json: false,
            timestamp: true,
            label: "Sentinel.Socket",
            colorize: true
        })
    ]
});

var migration = new(winston.Logger)({
    transports: [
        new(winston.transports.Console)({
            level: 'debug'
        }),
        new(winston.transports.File)({
            name: 'error-file',
            filename: 'logs/migrations.log',
            level: 'debug'
        })
    ]
});

exports.app = app;
exports.socket = socket;
exports.migration = migration;