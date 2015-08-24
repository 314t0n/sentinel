define(['sentinel.app'], function(app) {
    'use strict';

    var injectParams = ['$resource', '$routeParams'];

    var imagelogFactory = function($resource, $routeParams) {

        return function(src) {

            return $resource(src, {
                method: 'getTask',
                q: '*'
            }, {
                'query': {
                    method: 'GET'
                }
            });

        }

    }

    imagelogFactory.$inject = injectParams;

    app.register.factory('imagelogFactory', imagelogFactory);

});