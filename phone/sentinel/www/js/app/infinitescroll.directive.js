(function() {

    sentinelApp.directive('whenScrolled', function($swipe) {
        return function(scope, elem, attr) {
            var raw = elem[0];

            elem.bind('scroll', moveHandler);

            $swipe.bind($(elem), {
                'move': moveHandler
            });

            function moveHandler() {
                if (raw.scrollTop + raw.offsetHeight >= raw.scrollHeight) {
                    scope.$apply(attr.whenScrolled);
                }
            }

        };
    });

})();