define(['router.service', 'sentinel.utils'], function() {
    'use strict';

    var app = angular.module('SentinelApp', [
        'ngRoute',
        'ngResource',
        'ngStorage',
        'routeResolverService',
        'ui.bootstrap',
        'toggle-switch',
        'bootstrapLightbox',
        'toaster',
        'ui.bootstrap.datetimepicker',
        'timer',
        'n3-pie-chart'
    ]);

    app.config(['$routeProvider', 'routeResolverProvider', '$controllerProvider',
        '$compileProvider', '$filterProvider', '$provide', '$httpProvider', '$locationProvider', '$sceDelegateProvider', 'cfpLoadingBarProvider', 'LightboxProvider',

        function($routeProvider, routeResolverProvider, $controllerProvider,
            $compileProvider, $filterProvider, $provide, $httpProvider, $locationProvider, $sceDelegateProvider, cfpLoadingBarProvider, LightboxProvider) {
            //use history api instead of #
            $locationProvider.html5Mode(true);
            //template for lightbox gallery
            LightboxProvider.templateUrl = 'partials/lightbox.jade';
            //Remove loading bar spinner
            cfpLoadingBarProvider.includeSpinner = false;
            //Allow resouces from these urls
            $sceDelegateProvider.resourceUrlWhitelist([
                'self',
                config.baseUrl + '**',
                'http://sentinel:*/**'
            ]);
            //required for dynamic register
            app.register = {
                controller: $controllerProvider.register,
                directive: $compileProvider.directive,
                filter: $filterProvider.register,
                factory: $provide.factory,
                service: $provide.service
            };

            var router = routeResolverProvider.router;

            $routeProvider
                .when('/config/', router.resolve('ConfigIndex', 'config/config.ctrl', 'config'))
                .when('/config/:cam', router.resolve('ConfigIndex', 'config/config.ctrl', 'config'))
                .when('/login', router.resolve('LoginIndex', 'auth/login.ctrl', 'login', false))
                .when('/dashboard', router.resolve('Dashboard', 'dashboard/dashboard.ctrl', 'dashboard'))
                .when('/notification', router.resolve('NotificationIndex', 'notification/notification.ctrl', 'notification'))
                .when('/notification/:cam', router.resolve('NotificationIndex', 'notification/notification.ctrl', 'notification'))
                .when('/imagelog', router.resolve('ImagelogIndex', 'imagelog/imagelog.ctrl', 'imagelog'))
                .when('/imagelog/:cam', router.resolve('ImagelogIndex', 'imagelog/imagelog.ctrl', 'imagelog'))
                .when('/livestream', router.resolve('StreamIndex', 'stream/stream.ctrl', 'stream'))
                .when('/livestream/:cam', router.resolve('StreamIndex', 'stream/stream.ctrl', 'stream'))
                .when('/', {
                    redirectTo: '/dashboard'
                })
                .otherwise({
                    /*redirectTo: '/'*/
                    templateUrl: 'partials/404'
                });
            //Send auth token with every request
            $httpProvider.interceptors.push(['$q', '$location', '$localStorage',
                function($q, $location, $localStorage) {
                    return {
                        'request': function(config) {
                            config.headers = config.headers || {};
                            if ($localStorage.token) {
                                config.headers.Authorization = 'Bearer ' + $localStorage.token;
                            }
                            return config;
                        },
                        'responseError': function(response) {
                            if (response.status === 401 || response.status === 403) {
                                $location.path('/login');
                            }
                            return $q.reject(response);
                        }
                    };
                }
            ]);
        }

    ]);


    app.run(['$route', '$rootScope', '$location', 'authService',
        function($route, $rootScope, $location, authService) {
            //Path change will not redirect
            var original = $location.path;
            $location.path = function(path, reload) {
                if (reload === false) {
                    var lastRoute = $route.current;
                    var un = $rootScope.$on('$locationChangeSuccess', function() {
                        $route.current = lastRoute;
                        un();
                    });
                }
                return original.apply($location, [path]);
            };
            //Auth before routing
            $rootScope.$on("$routeChangeStart", function(event, next, current) {
                if (next && next.$$route && next.$$route.secure) {

                    if (!authService.isLoggedIn()) {

                        authService.authenticate(function() {
                            $location.path($location.path());
                        }, function() {

                            $rootScope.$evalAsync(function() {
                                authService.redirectToLogin();
                                $location.path('/login');

                            });

                        });

                    }

                }
            });

        }
    ]);

    /**
     * GLOBAL CONFIG
     */

    app.value('config', {

        socketUrl: config.baseUrl,
        sockets: {
            camera: 'camera-client',
            mdetect: 'motion-detect-client',
            stream: 'stream-client'
        }

    });

    return app;

});