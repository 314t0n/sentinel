(function() {

    var injectParams = ['notificationFactory', '$filter'];

    var listService = function(notificationFactory, $filter) {

        var config = {

            offset: 1,
            limit: 5,
            sortType: 'DESC'

        };

        var imageGallery = [];

        /**
         * Loads the data to the Scope
         * @param  {Angular}  $scope                Current Scope
         * @param  {Angular}  $routeParams  		Additional params (limit, sort, ...)
         * @param  {Resource} notificationFactory 	Data endpoint
         * @return {void}
         */
        function updateImagelogList($scope, $routeParams, notificationFactory, isAppend) {

            $scope.loading = true;

            config.offset = $scope.currentPage;

            var params = setQueryParams($routeParams);

            return function(fn) {

                notificationFactory(app.baseUrl + 'api/v1/notification').query(params,

                    function(data, responseHeaders) {

                        var classes = {
                            'info': 'fa-info',
                            'warning': 'fa-flash',
                            'system-info': 'fa-code-fork'
                        };

                        var itemClass = 'fa fa-fw ';

                        if (isAppend) {

                            Array.prototype.push.apply($scope.filteredNotifications, data.notifications.map(setAttributes));

                        } else {

                            $scope.filteredNotifications = data.notifications.map(setAttributes);

                        }
                        // set attributes for ui settings
                        function setAttributes(el) {
                            var i = classes[el.level] || '';
                            el.class = itemClass + i;
                            el.showImg = typeof el.image !== 'undefined';
                            return el;
                        }

                        /*updateImageGallery($scope.filteredNotifications);*/

                        fn();

                    });

            }

        }
        /**
         * Sets the default params and the additional params
         * @param {Angular} $routeParams additional params
         */

        function setQueryParams($routeParams) {

            var params = {
                offset: config.offset - 1,
                limit: config.limit,
                sortType: config.sortType
            };

            $.each(getQueryParams($routeParams), function(key, value) {
                params[key] = value;
            });

            return params;

        }
        /**
         * Sets the params from Querystring
         * @param  {[type]} $routeParams [description]
         * @return {[type]}              [description]
         */
        function getQueryParams($routeParams) {

            var params = {};

            if (typeof $routeParams.from !== 'undefined' && typeof $routeParams.to !== 'undefined') {

                params['from'] = $routeParams.from;
                params['to'] = $routeParams.to;

            }

            if (typeof $routeParams.unread !== 'undefined') {
                if($routeParams.unread === 'true'){
                     params['unread'] = true;
                }    
            }

            if (typeof $routeParams.cam !== 'undefined') {
                if ($routeParams.cam !== 'all') {
                    params['name'] = $routeParams.cam;
                }
            }

            return params;
        }

        function updateImageGallery(imageData) {

            imageGallery = imageData.map(function(el) {

                if (typeof el.image !== 'undefined') {

                    return {
                        url: 'data:image/jpg;base64,' + el.image,
                        caption: '[' + el.cam + '] ' + $filter('dateFilter')(el.date),
                        thumbUrl: 'data:image/jpg;base64,' + el.image
                    }
                    
                }

                return 'undefined';

            });

        }

        return {
            update: function($scope, $routeParams, isAppend, fn) {
                console.log('list service')
                var append = isAppend === 'undefined' ? false : isAppend;
                var promise = updateImagelogList($scope, $routeParams, notificationFactory, append);
                return promise(function() {
                    if (typeof fn === 'function') {
                        fn();
                    }
                });
            },
            config: config,
            getImageArray: function() {
                return imageGallery;
            }
        }

    }

    listService.$inject = injectParams;

    sentinelApp.factory('notificationListService', listService);

})();