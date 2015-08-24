var multimap = require('./multimap');

var streamClient = function streamClient() {

    var map = multimap.multimapFactory();

    function hasKey(id) {
        return map.hasOwnProperty(id);
    }

    return {
        add: function(key, socket) {
            map.add(key, socket);
        },
        remove: function(key, socket) {
            map.remove(key, socket);
        },
        getSocketsByKey: function(key) {
            return map.getElemByKey(key)
        },
        broadcastTo: function(key, id, msg) {
            if (map.hasKey(key)) {
                map.getElemByKey(key).forEach(function(socket) {
                    socket.emit(id, msg);
                });
            }
        },
        removeAll: function(key) {
            if (map.hasKey(key)) {
                map.getElemByKey(key).length = 0;
            }
        }
    }

}

exports.create = function() {
    return streamClient();
}