define(['sentinel.app'], function(app) {
    'use strict';

    var injectParams = ['$filter', '$location', '$routeParams'];

    var paginationService = function($filter, $location, $routeParams) {

        var currentPage = setCurrentPage();

        console.log('page service', currentPage)

        function setCurrentPage() {
            if (typeof $routeParams.page !== 'undefined') {
                return parseInt($routeParams.page, 10);
            }
            return 1;
        }

        return {
            getCurrentPage: function() {
                return currentPage;
            },
            setCurrentPage: function(page){
                currentPage = page;
            }
        }

    }

    paginationService.$inject = injectParams;

    app.register.factory('PaginationService', paginationService);

});