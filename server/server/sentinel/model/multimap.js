/**
 * Simple multimap implementation in Javascript
 * @return {multimap} 
 */
var multimap = function multimap() {

    var map = {};

    function hasKey(id) {
        return map.hasOwnProperty(id);
    }

    return {
        add: function(key, elem) {
            if (!hasKey(key)) {
                map[key] = [];
            }
            map[key].push(elem);
        },
        remove: function(key, elem) {
            if (hasKey(key)) {
                map[key] = map[key].filter(function(el) {
                    return elem !== el;
                });
            }
        },
        getElemByKey: function(key) {
            return map[key];
        },
        hasKey: function(key) {
            return hasKey(key);
        }
    }

}

exports.multimapFactory = function() {
    return multimap();
}