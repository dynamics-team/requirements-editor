/*globals angular, console*/
/**
 * Created by pmeijer on 10/7/2014.
 */

angular.module('RequirementsApp').controller('EditRequirementController', function ($scope, $modalInstance, data) {
    'use strict';
    $scope.data = data;

    $scope.ok = function () {
        $modalInstance.close($scope.data);
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
});