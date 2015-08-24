(function() {

    var injectParams = ['$resource'];

    var userFactory = function($resource) {

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
                }
            });

        }

    }

    userFactory.$inject = injectParams;

    sentinelApp.factory('userFactory', userFactory);

})();