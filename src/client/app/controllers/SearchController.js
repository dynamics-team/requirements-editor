/*globals angular, console*/
/**
 * @author lattmann / https://github.com/lattmann
 */

angular.module('RequirementsApp').controller('SearchController', function (SearchService, $scope) {
    'use strict';

    var self = this;

    console.log('SearchController');

    $scope.model = {
        data: {}
    };

    $scope.search = function (search_query) {
        SearchService.search(search_query)
            .then(function (data) {
                // TODO: handle error here
                $scope.model.data = data;
                console.log(data);
            });
    };

});