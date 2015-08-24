var utils = require('../utils');

var bcrypt = require('bcrypt-nodejs');

var user = function user(email, password) {

	utils.checkParam(email, 'email');
    utils.checkParam(password, 'password');

    return {
        email: email,
        //notificationEmail: null,
        devices: {},
        password: bcrypt.hashSync(password),
        created_at: new Date(),
        update_at: new Date()
    }

};

exports.create = function(email, password){
	return user(email, password);
}