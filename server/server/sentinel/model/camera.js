var utils = require('../utils');
/**
 * Camera prototype
 * @param  {String} name name of the device @required
 * @return {Camera}      prototype with default values
 */
var camera = function camera(name) {

	utils.checkParam(name, "name");

    return {
        _id: null,
        name: name,
        status: false,
        id: name,
        isDeleted: false,   
        imagelog: {
            status: false,
            storeImage: false,
            interval: 1,
            storeDays: 1,
        },
        motionDetect: {      
            sensitivy: 1,  
            status: false,
            storeDays: 1,
            storeImage: false,
            threshold: 5000
        },
        resolution: {
            x: 320,
            y: 240
        },
        fps: 10,
        size:{}
        /* 
        dropbox:{
            apikey: "undefined",
            apisecret: "undefined",
            enabled: false
        }*/
    }
}

exports.create = function(name) {
    return camera(name);
}