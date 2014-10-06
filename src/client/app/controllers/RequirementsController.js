/*globals angular, console*/
/**
 * Created by pmeijer on 10/6/2014.
 */

angular.module('RequirementsApp').controller('RequirementsController', function ($scope) {
    'use strict';
    $scope.dataModel = {
        name: 'Requirements'
    };
    console.log('RequirementsController');
});