define(['sentinel.app'], function(app) {
    'use strict';

    var injectParams = ['$resource'];

    var configFactory = function($resource) {

        return $resource('/api/v1/config/:id', {
            id: '@_id'
        }, {
            update: {
                method: 'PUT',
                isArray: false
            }

        });
    };

    configFactory.$inject = injectParams;

    app.register.factory('configFactory', configFactory);

});