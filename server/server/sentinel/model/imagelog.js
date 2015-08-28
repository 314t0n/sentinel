var utils = require('../utils');

var imagelog = function imagelog(name, image, cam, date) {

	utils.checkParam(name, 'name');
    utils.checkParam(image, 'image');
    utils.checkParam(cam, 'cam');
    utils.checkParam(date, 'date');

    return {
        _id:null,
        name: name,
        image: image,
        cam: cam,
        date: date
    }

};

exports.create = function(name, image, cam, date){
	return imagelog(name, image, cam, date);
}