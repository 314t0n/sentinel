define(['sentinel.app', 'imagelog/imagelog.factory', 'pagination.service'], function(app) {
    'use strict';

    var injectParams = ['imagelogFactory', '$filter', '$location', 'PaginationService', '$timeout', '$rootScope'];

    var listService = function(imagelogFactory, $filter, $location, PaginationService, $timeout, $rootScope) {


        var config = {

            offset: 1,
            limit: 10,
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

            console.log('params', params);

            imagelogFactory('/api/v1/imagelog').query(params,

                function(data, responseHeaders) {

                    $scope.filteredImagelogs = data.imagelogs;

                    updateImageGallery(data.imagelogs);

                    //$scope.totalItems = (data.count-config.limit) * config.limit;

                    $scope.loading = false;

                });


            imagelogFactory('/api/v1/imagelog/count').query(params,

                function(data, responseHeaders) {

                    $scope.totalItems = data.count;

                });

        }
        /**
         * Format images for imagegallery
         * @param  {Array} imageData images
         * @return {Array}
         */
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

            /*if (typeof $routeParams.page !== 'undefined') {
                params['offset'] = parseInt($routeParams.page, 10) - 1;
            } else {
                params['offset'] = 0;
            }*/

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

    app.register.factory('imagelogListService', listService);

});