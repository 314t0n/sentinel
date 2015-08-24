var clientModel = function clientModel() {

    var list = {};

    return {

        hasKey: function(id) {
            return list.hasOwnProperty(id);
        },
        /**
         * emit socket
         * @param  {String} socketId   socket id
         * @param  {String} command    message id
         * @param  {Object} msg        message to send
         */
        emit: function(socketId, msg) {
            if (list.hasOwnProperty(socketId)) {
                list[socketId].emit(socketId, msg);
            }
        },
        keys: function(){
            return Object.keys(list);
        },
        /**
         * broadcast for all socket
         * @param  {[type]} id  message id
         * @param  {[type]} msg message
         */
        broadcast: function(id, msg) { 
            Object.keys(list).forEach(function(value, index) {
                list[value].emit(id, msg);             
            });
        },    
        disconnect: function(socketId) {
            if (this.hasOwnProperty(socketId)) {
                this[socketId].disconnect();
            }
        },
        /**
         * add socket by id
         * @param  {[type]} id     [description]
         * @param  {[type]} socket [description]
         * @return {[type]}        [description]
         */
        put: function(id, socket) {
            list[id] = socket;
        },
        remove: function(socket) {
            delete list[socket.id];
        },
        removeById: function(socketId) {            
            if (list.hasOwnProperty(socketId)) {
                delete list[socketId];
            }
        },
        each: function(fn) {
            Object.keys(list).forEach(function(value, index) {
                fn(list[value], index);
            });
        },
        filter: function(fn) {
            return Object.keys(list).filter(function(value, index){
                return fn(list[value], index);
            });
        },
        size: function() {
            return Object.keys(list).length;
        }
    };
}

exports.create = function() {
    return clientModel();
}