(function() {

	var injectParams = []; 

    var eventBinder = function() {
       
        //holds the eventListener references
        var eventListeners = [];
        var _$scope = null;
   
        return {

            setScope: function($scope){
                _$scope = $scope;
            },
            add: function(eventName, callback) {

                if(_$scope == null){
                    throw new Error('Error: scope is null. Did you forget to call .setScope($scope) ?');
                }

                var eventListener = _$scope.$on(eventName, callback);
                eventListeners.push(eventListener);
            },
            removeAll: function(){
                eventListeners.forEach(function(el){
                    //angular way to remove eventListener
                    el.call(null);
                });
                eventListeners.length = 0;   
            }

        }

    }  

    eventBinder.$inject = injectParams;

    sentinelApp.factory('EventBinderService', eventBinder);

})();