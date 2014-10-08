/*globals angular, console*/
/**
 * Created by pmeijer on 10/8/2014.
 */

angular.module('RequirementsApp').controller('NewRequirementController', function ($scope, $modalInstance, data) {
    'use strict';
    $scope.data = {
        name: data.name
        //TODO: Add user permissions etc...
    };

    $scope.ok = function () {
        $modalInstance.close($scope.data);
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
});