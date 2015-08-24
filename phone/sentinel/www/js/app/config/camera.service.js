(function() {

    var injectParams = ['$resource'];

    var cameraFactory = function($resource) {

        return $resource(app.baseUrl + 'api/v1/config/camera/:id', {
            id: '@_id'
        }, {
            update: {
                method: 'PUT',
                isArray: false
            }

        });
    };

    cameraFactory.$inject = injectParams;

    sentinelApp.factory('cameraFactory', cameraFactory);

})();