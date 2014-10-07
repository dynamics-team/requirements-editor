/*globals angular, console*/
/**
 * Created by pmeijer on 10/7/2014.
 */

angular.module('RequirementsApp').controller('EditRequirementController', function ($scope, $modalInstance, data) {
    'use strict';
    $scope.data = {
        isReq: data.hasOwnProperty('children') === false,
        name: data.name,
        description: data.description,
        weightNeg: data.weightNeg,
        weightPos: data.weightPos,
        Priority: data.Priority
    };

    if ($scope.data.isReq) {
        $scope.data.KPP = data.KPP;
        $scope.data.function = data.function;
        $scope.data.objective = data.objective;
        $scope.data.threshold = data.threshold;
        $scope.data.unit = data.unit;
        $scope.data.metricName = data.metricName;
        $scope.data.testBench = data.testBench;
    }

    $scope.ok = function () {
        $modalInstance.close($scope.data);
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
});