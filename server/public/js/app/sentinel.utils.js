// Create new SentinelApp

window.SentinelApp = (function($) {

    console.group("SentinelApp v0.5");

    var app = {
        
        isUndefined: function(obj){
            return typeof obj === void 0;
        }

    }

    return app;

})(jQuery);