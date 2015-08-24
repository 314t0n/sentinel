var utils = require('../utils');
/**
 * Notification model
 * @param  {String} cam     Camera name
 * @param  {String} message Message text
 * @param  {String} level   error, info, etc..
 * @param  {String} image   base64
 * @param  {Date}   date    utc
 * @return {Object}         
 */
var notification = function notification(cam, message, level, image, date) {

    utils.checkParam(cam, 'cam');
    utils.checkParam(message, 'message');

    return {
        cam: cam,
        message: message,
        level: level || 'info',
        date: date || getDate(),
        image: image || null
    }

};

exports.create = function(cam, message, level, image, date) {
    return notification(cam, message, level, image, date);
}