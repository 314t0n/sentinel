(function() {

    var injectParams = ['imagelogFactory', '$filter'];

    var listService = function(imagelogFactory, $filter) {

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
         * @param  {Resource} imagelogFactory 	Data endpoint
         * @return {void}
         */
        function updateImagelogList($scope, $routeParams, imagelogFactory) {

            $scope.loading = true;

            config.offset = $scope.currentPage;

            var params = setQueryParams($routeParams);

            imagelogFactory(app.baseUrl + 'api/v1/imagelog').query(params,

                function(data, responseHeaders) {

                    $scope.filteredImagelogs = data.imagelogs;

                    /*updateImageGallery(data.imagelogs);*/

                    $scope.totalItems = data.count;

                    $scope.loading = false;

                });

        }

        function updateImageGallery(imageData) {

            imageGallery = imageData.map(function(el) {

                return {
                    url: 'data:image/jpg;base64,' + el.image,
                    caption: '[' + el.cam + '] ' + $filter('dateFilter')(el.date),
                    thumbUrl: 'data:image/jpg;base64,' + el.image
                }

            });

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

            if (typeof $routeParams.cam !== 'undefined') {
                if ($routeParams.cam !== 'all') {
                    params['name'] = $routeParams.cam;
                }
            }

            return params;
        }

        return {
            update: function($scope, $routeParams) {
                updateImagelogList($scope, $routeParams, imagelogFactory);
            },
            config: config,
            getImageArray: function() {
                return imageGallery;
            }
        }

    }

    listService.$inject = injectParams;

    sentinelApp.factory('imagelogListService', listService);

})();