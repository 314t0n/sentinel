var logger = require('../logger').app;
/**
 * Changing ip, port in config if args defined
 * @param {Object} config [in out] 
 */
function setConfig(config) {

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

}

exports.setConfig = setConfig;