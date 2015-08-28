define(['sentinel.app'], function(app) {
    'use strict';

    var injectParams = ['$resource'];

    var cameraFactory = function($resource) {

        return $resource('/api/v1/config/camera/:id', {
            id: '@_id'
        }, {
            update: {
                method: 'PUT',
                isArray: false
            },
            'delete': {
                method: 'DELETE',
                isArray: false
            }

        });
    };

    cameraFactory.$inject = injectParams;

    app.register.factory('cameraFactory', cameraFactory);

});