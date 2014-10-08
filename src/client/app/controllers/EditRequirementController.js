/*globals angular, console*/
/**
 * Created by pmeijer on 10/7/2014.
 */

angular.module('RequirementsApp').controller('EditRequirementController', function ($scope, $modalInstance, data) {
    'use strict';
    var getNumber = function (value, range) {
        if (typeof value === 'number' && value >= range.min && value <= range.max) {
            return value;
        }
        return 1;
    };
    $scope.data = {
        isReq: data.hasOwnProperty('children') === false,
        name: data.name,
        description: data.description,
        weightNeg: getNumber(data.weightNeg, {min: 0, max: 1}),
        weightPos: getNumber(data.weightPos, {min: 0, max: 1}),
        Priority: getNumber(data.Priority, {min: 0, max: 99999999})
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
        $scope.data.weightNeg = parseFloat($scope.data.weightNeg);
        $scope.data.weightPos = parseFloat($scope.data.weightPos);
        $modalInstance.close($scope.data);
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
});