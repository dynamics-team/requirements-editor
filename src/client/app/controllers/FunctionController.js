/*globals angular, console*/

/**
 * Created by pmeijer on 10/9/2014.
 */

angular.module('RequirementsApp').controller('FunctionController', function ($scope, $modalInstance, data) {
    'use strict';
    $scope.dataModel = {
        type: data.type,
        invert: data.invert
    };
    $scope.close = function () {
        $modalInstance.close();
    };
});