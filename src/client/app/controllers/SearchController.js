/*globals angular, console*/
/**
 * @author lattmann / https://github.com/lattmann
 */

angular.module('RequirementsApp').controller('SearchController', function (SearchService, $scope, $location) {
    'use strict';

    var self = this;

    console.log('SearchController');

    $scope.model = {
        data: {}
    };
    $scope.search_query = $location.search().q;

    $scope.search = function (search_query) {

        $location.search('q', search_query);

        SearchService.search(search_query)
            .then(function (data) {
                // TODO: handle error here
                $scope.model.data = data;
                console.log(data);
            });
    };

    if ($scope.search_query) {
        $scope.search($scope.search_query);
    }

});