(function() {

	var injectParams = ['$localStorage']; 

    var broadcastService = function($localStorage) {
    	/**
    	 * IntentService only needs the names
    	 * @param  {Array} cameras list of cameras
    	 * @return {Array}         list of camera names
    	 */
        function getCameraIds(cameras) {
            return cameras.map(function(camera) {
                return camera.name;
            });
        }
        /**
         * Check Cordova plugins 
         * @param  {String} name plugin name
         * @return {Boolean}     plugin installed
         */
        function checkPlugin(name) {         
            if (typeof window.plugins !== 'undefined') {
                return name in window.plugins;
            }
            return false;
        }
        /**
         * Send Broadcast to Activity
         * @param  {Array} cameras list of cameras
         * @return {Void}
         */
        function start(cameras) {

        	console.log(cameras.length)

            //send only the ids

            var ids = getCameraIds(cameras);

            //command 1 -> start
            window.plugins.webintent.sendBroadcast({
                action: 'hu.elte.hajnaldavid.sentinel.command',
                extras: {
                    'command': 1,
                    'cameras': ids,
                    'token': $localStorage.token,
                    'socket_url': app.baseUrl
                }
            }, function() {
                console.log('success');
            }, function(err) {
                console.log('error');
                console.error(err);
            });
        }
        /**
         * Stop intentservice
         * @param  {String} id Device UUID
         * @return {Void}    
         */
        function stop(id) {
            console.log('stoppp');
            window.plugins.webintent.sendBroadcast({
                action: 'hu.elte.hajnaldavid.sentinel.command',
                extras: {
                    'command': 0
                }
            }, function() {
                console.log('success');
            }, function(err) {
                console.log('error');
                console.error(err);
            });

        }

        return {

            start: function(cameras) {
            	console.log('start')
                if (checkPlugin('webintent')) {                
                    start(cameras);
                }
            },
            stop: function() {
                if (checkPlugin('uniqueDeviceID')) {
                    window.plugins.uniqueDeviceID.get(function(id) {
                        stop(id);
                    });
                }
            }

        }

    }

    broadcastService.$inject = injectParams;

    sentinelApp.factory('BroadcastService', broadcastService);

})();