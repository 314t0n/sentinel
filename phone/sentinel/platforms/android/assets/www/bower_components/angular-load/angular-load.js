/* angular-load.js / v0.2.0 / (c) 2014 Uri Shaked / MIT Licence */

(function() {
    'use strict';

    angular.module('angularLoad', [])
        .service('angularLoad', ['$document', '$q', '$timeout',

            function($document, $q, $timeout) {

                function loader(createElement) {

                    return function(sources) {

                        var promises = $.map(sources, function(src) {

                            var deferred = $q.defer();
                            var element = createElement(src);

                            element.onload = element.onreadystatechange = function(e) {
                                $timeout(function() {
                                    deferred.resolve(e);
                                });
                            };

                            element.onerror = function(e) {
                                $timeout(function() {
                                    deferred.reject(e);
                                });
                            };

                            return deferred.promise;

                        });

                        return promises;
                    }
                }

                var jsSrc = [];
                var cssSrc = [];

                var loadJS = loader(function(src) {

                    var script = $document[0].createElement('script');

                    script.src = src;

                    $document[0].body.appendChild(script);
                    return script;

                });

                var loadCSS = loader(function(href) {

                    var style = $document[0].createElement('link');

                    style.rel = 'stylesheet';
                    style.type = 'text/css';
                    style.href = href;

                    $document[0].head.appendChild(style);
                    return style;

                });

                /**         
                 * @returns {*} Promise that will be resolved once the script has been loaded.
                 */
                this.load = function() {

                    return $.when(loadJS(jsSrc), loadCSS(cssSrc));

                }
                /**
                 * Dynamically loads the given script
                 * @param src The url of the script to load dynamically
                 * @returns {*} Promise that will be resolved once the script has been loaded.
                 */
                this.addJS = function(src) {
                    [].push.apply(jsSrc, src);
                    return this;
                }

                /**
                 * Dynamically loads the given CSS file
                 * @param href The url of the CSS to load dynamically
                 * @returns {*} Promise that will be resolved once the CSS file has been loaded.
                 */
                this.addCSS = function(href) {
                    [].push.apply(cssSrc, href);
                    return this;
                }
            }
        ]);
})();