var app = {
    baseUrl: 'http://192.168.0.14:3000/',  
    initialize: function() {
        
        var app = document.URL.indexOf('http://') === -1 && document.URL.indexOf('https://') === -1;

        if (app) { // on device
            console.log('Init::Phonegap');
            this.bindEvents();
        } else { // testing on desktop
            console.log('Init::Desktop');    
            this.onDeviceReady();        
        }   

    },
    
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, true);
    },

    onDeviceReady: function() {
        console.log('deviceready');
        angular.element(document).ready(function() {
            angular.bootstrap(angular.element('body'), ['SentinelApp']);
        });
    },
};

var isUndefined = function(obj) {
    return typeof obj === void 0;
}