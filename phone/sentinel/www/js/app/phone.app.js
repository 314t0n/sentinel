var sentinelApp = angular.module('SentinelApp', [
    'ngRoute',
    'ngResource',
    'ngStorage',
    'ngTouch',
    'ui.bootstrap',
    'toggle-switch',
    'toaster',
    'ui.bootstrap.datetimepicker',
    'angular-datepicker',
    'mobile-angular-ui',
    'bootstrapLightbox',
    'timer',
    'mobile-angular-ui.gestures',
    'QuickList'
]).config(['$routeProvider', '$controllerProvider',
    '$compileProvider', '$filterProvider', '$provide', '$httpProvider', '$locationProvider', '$sceDelegateProvider', 'cfpLoadingBarProvider', 'LightboxProvider',
    function($routeProvider, $controllerProvider,
        $compileProvider, $filterProvider, $provide, $httpProvider, $locationProvider, $sceDelegateProvider, cfpLoadingBarProvider, LightboxProvider) {

        /*cfpLoadingBarProvider.includeSpinner = false;*/
        $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|tel):/);

        LightboxProvider.templateUrl = 'partials/template/lightbox.html';

        $sceDelegateProvider.resourceUrlWhitelist([
            'self',
            'http://localhost:*/**',
            app.baseUrl
        ]);

        /*$locationProvider.html5Mode(false);*/

        $routeProvider
            .when('/', {
                redirectTo: '/dashboard'
            }).when('/dashboard', {
                controller: 'DashboardCtrl',
                templateUrl: 'partials/dashboard.html',
                secure: true,
                reloadOnSearch: false
            }).when('/imagelog', {
                controller: 'ImagelogIndexCtrl',
                templateUrl: 'partials/imagelog.html',
                secure: true,
                reloadOnSearch: false
            }).when('/imagelog/:cam', {
                controller: 'ImagelogIndexCtrl',
                templateUrl: 'partials/imagelog.html',
                secure: true,
                reloadOnSearch: false
            }).when('/notification', {
                controller: 'NotificationIndexCtrl',
                templateUrl: 'partials/notification.html',
                secure: true,
                reloadOnSearch: false
            }).when('/notification/:cam', {
                controller: 'NotificationIndexCtrl',
                templateUrl: 'partials/notification.html',
                secure: true,
                reloadOnSearch: false
            }).when('/livestream', {
                controller: 'StreamIndexCtrl',
                templateUrl: 'partials/stream.html',
                secure: true,
                reloadOnSearch: false
            }).when('/livestream/:cam', {
                controller: 'StreamIndexCtrl',
                templateUrl: 'partials/stream.html',
                secure: true,
                reloadOnSearch: false
            }).when('/config', {
                controller: 'ConfigIndexCtrl',
                templateUrl: 'partials/config.html',
                secure: true,
                reloadOnSearch: false
            }).when('/config/:cam', {
                controller: 'ConfigIndexCtrl',
                templateUrl: 'partials/config.html',
                secure: true,
                reloadOnSearch: false
            }).when('/profile', {
                controller: 'ProfileIndexCtrl',
                templateUrl: 'partials/profile.html',
                secure: true,
                reloadOnSearch: false
            }).when('/login', {
                controller: 'LoginIndexCtrl',
                templateUrl: 'partials/login.html'
            });

        //Authorization
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
                            $location.path('/login').replace();
                        }
                        return $q.reject(response);
                    }
                };
            }
        ]);

    }

]);
//Globals
sentinelApp.value('config', {    
    socketUrl: app.baseUrl || 'http://localhost',
    sockets: {
        camera: 'camera-client',
        mdetect: 'motion-detect-client',
        stream: 'stream-client'
    }
});

sentinelApp.run(['$route', '$rootScope', '$location', 'authService',

    function($route, $rootScope, $location, authService) {

        //
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

        //Authoriztaion
        $rootScope.$on("$routeChangeStart", function(event, next, current) {
            if (next && next.$$route && next.$$route.secure) {
                if (!authService.isLoggedIn()) {

                    authService.authenticate(function() {

                        $location.path($location.path());
                    }, function() {

                        console.log('login');
                        $rootScope.$evalAsync(function() {
                            authService.redirectToLogin();
                            $location.path('/login').replace();

                        });

                    });

                }

            }
        });

    }
]);