(function() {

    var injectParams = ['$resource'];

    var configFactory = function($resource) {

        return $resource(app.baseUrl + 'api/v1/config/:id', {
            id: '@_id'
        }, {
            update: {
                method: 'PUT',
                isArray: false
            }

        });
    };

    configFactory.$inject = injectParams;

    sentinelApp.factory('configFactory', configFactory);
    
})();