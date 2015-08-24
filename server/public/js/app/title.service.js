define(['sentinel.app'], function(app) {
    'use strict';

    var injectParams = ['$document'];

    var titleService = function($document) {

        var title = "Sentinel";

        function setTitle(n) {
            if (n > 0) {
                $document.prop('title', title + '(' + n + ')');
            } else {
                $document.prop('title', title);
            }
        }

        return {
            setNotificationNumber: function(n) {
                setTitle(n);
            }
        }

    }

    titleService.$inject = injectParams;

    app.register.factory('TitleService', titleService);

});