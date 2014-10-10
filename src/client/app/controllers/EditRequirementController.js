/*globals angular, console*/
/**
 * Created by pmeijer on 10/7/2014.
 */

angular.module('RequirementsApp').controller('EditRequirementController', function ($scope, $modal, $modalInstance, data) {
    'use strict';
    var getNumber = function (value, range) {
            if (typeof value === 'number' && value >= range.min && value <= range.max) {
                return value;
            }
            return 1;
        },
        getFunctionType = function (fun) {
            var validFunctions = {
                Linear: true,
                Exponential: true,
                Logarithmic: true
            };
            if (validFunctions[fun]) {
                return fun;
            }
            return 'Linear';
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
        $scope.data.function = getFunctionType(data.function);
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

    $scope.viewFunction = function (data) {
        var modalInstance,
            invert = false;
        if (typeof data.objective === 'number' && typeof data.threshold === 'number') {
            if (data.threshold > data.objective) {
                invert = true;
            }
        }
        modalInstance = $modal.open({
            templateUrl: 'templates/Function.html',
            controller: 'FunctionController',
            size: 'lg',
            resolve: {
                data: function () {
                    return {
                        type: data.function,
                        invert: invert
                    };
                }
            }
        });

        modalInstance.result.then(function () {
            console.log('Modal dismissed at: ' + new Date());
        }, function () {
            console.log('Modal dismissed at: ' + new Date());
        });
    };
});