define(['sentinel.app'], function(app) {
    'use strict';

    var injectParams = ['$resource', '$routeParams'];

    var notificationFactory = function($resource, $routeParams) {

        return function(src) {

            return $resource(src, {
                id: '@_id'
            }, {
                query: {
                    method: 'GET'
                },
                update: {
                    method: 'PUT',
                    isArray: false
                },
                markAsRead: {
                    method: 'PUT',
                    isArray: false,                   
                }

            });  

        }

    }

    notificationFactory.$inject = injectParams;

    app.register.factory('notificationFactory', notificationFactory);

});