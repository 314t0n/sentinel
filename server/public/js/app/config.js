requirejs.config({
    /*baseUrl: 'bower_components',*/
    baseUrl: 'js/app',
    
/*    paths: {
        app: ''
    }*/
});

//defaults
require(
    [
        'sentinel.app',
        'router.service',         
        'auth/auth.service',      
        'navbar/navbar.ctrl'         
    ],
    function() {
        angular.bootstrap(document, ['SentinelApp']);
    });