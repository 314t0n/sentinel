define([], function() {
    'use strict';

    /**
     * Service for resolve route dependencies
     * @return {[type]} [description]
     */
    var routeResolver = function() {

        var config = {
            templatePath: 'partials/',
            toPath: function(path) {
                return 'js/app/' + path + '.js';
            }
        };

        /**
         * Resolve dependecies
         * @param  {String}         name     Controller Name
         * @param  {Array|String}   paths    Controller path, other paths will resolved as well
         * @param  {String}         template Partial
         * @param  {Boolean}        secure   Url require authentication, default is true
         * @return {Object}                  routeDefiniton for routeProvider
         */
        function resolve(name, path, template, secure, reloadOnSearch) {

            var routeDefiniton = {};
            routeDefiniton.templateUrl = config.templatePath + template;
            routeDefiniton.controller = name + 'Ctrl';           
            routeDefiniton.secure = secure || true;
            routeDefiniton.reloadOnSearch = reloadOnSearch || false;

            routeDefiniton.resolve = {
                load: ['$q', '$rootScope',
                    function($q, $rootScope) {
                        var dependencies = [config.toPath(path)];
                        return resolveDependencies($q, $rootScope, dependencies);
                    }
                ]
            };

            return routeDefiniton;
        };
        /**
         * [resolveDependencies description]
         * @param  {Angular} $q           Angular
         * @param  {Angular} $rootScope   Angular
         * @param  {Array}   dependencies script paths
         * @return {Promise}              Promise for routeDefiniton
         */
        function resolveDependencies($q, $rootScope, dependencies) {
            var defer = $q.defer();            
            require(dependencies, function() {
                defer.resolve();
                $rootScope.$apply()
            });

            return defer.promise;
        };

        //exports
        this.router = {
            resolve: resolve
        };

        this.$get = function() {
            return this;
        };

    };

    var servicesApp = angular.module('routeResolverService', []);
    servicesApp.provider('routeResolver', routeResolver);

});