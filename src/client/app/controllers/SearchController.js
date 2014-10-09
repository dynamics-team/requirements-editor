/*globals angular, console*/
/**
 * @author lattmann / https://github.com/lattmann
 */

angular.module('RequirementsApp').controller('SearchController', function (SearchService, $scope, $location) {
    'use strict';

    var self = this,
        urlQuery = $location.search();

    console.log('SearchController');

    $scope.model = {
        data: {}
    };

    $scope.model.search_query = urlQuery.q;

    $scope.search = function () {
        var self = this,
            currentQuery = $location.search();

        $location.search('q', $scope.model.search_query);

        SearchService.search($scope.model.search_query, currentQuery.page, currentQuery.per_page)
            .then(function (data) {
                var page = Math.min(data.page, data.pages);

                if (page > data.pages) {
                    page = data.pages;
                }

                if (page < 1) {
                    page = 1;
                }

                // TODO: handle error here
                $scope.model.data = data;

                // update values based on response
                $location.search('page', page);
                $location.search('per_page', data.perPage);

                if (data.page > data.pages && data.pages !== 0) {
                    // infinite recursion??
                    self.search();
                }

                console.log(data);
            });
    };

    $scope.nextPage = function () {
        var nextPage;

        if ($scope.model.data.hasOwnProperty('page')) {
            nextPage = parseInt($scope.model.data.page) + 1;
            if (nextPage <= $scope.model.data.pages) {
                $location.search('page', nextPage);
                this.search($scope.model.search_query, nextPage, $scope.model.data.perPage);
            }
        }
    };

    $scope.prevPage = function () {
        var prevPage;

        if ($scope.model.data.hasOwnProperty('page')) {
            prevPage = parseInt($scope.model.data.page) - 1;
            if (prevPage > 0) {
                $location.search('page', prevPage);
                this.search($scope.model.search_query, prevPage, $scope.model.data.perPage);
            }
        }
    };

    // initial actions
    if ($scope.model.search_query) {
        $scope.search($scope.model.search_query, urlQuery.page, urlQuery.per_page);
    }
});