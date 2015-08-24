define(['sentinel.app'], function(app) {
    'use strict';

    app.register.filter('dateFilter', function() {
        return function(input) {
      /*      var localTime = moment.utc(input).toDate();
            localTime = moment(localTime).format('YYYY-MM-DD HH:mm:ss');
            return localTime;
            return new Date(input).toString();*/
            return moment(input).format('YYYY-MM-DD HH:mm:ss');
        };
    });

});