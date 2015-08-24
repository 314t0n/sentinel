(function(){

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

    sentinelApp.factory('imagelogFactory', imagelogFactory);

})();