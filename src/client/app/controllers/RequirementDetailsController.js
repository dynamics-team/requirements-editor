/*globals angular, console*/
/**
 * Created by pmeijer on 10/6/2014.
 */

angular.module('RequirementsApp').controller('RequirementDetailsController', function (RequirementsService, $scope, $stateParams) {
    'use strict';
    console.log('RequirementDetailsController');
    var reqName = $stateParams.requirementId;
    console.log(reqName);
    $scope.dataModel = {
        title: reqName,
        rawString: ''
    };

    RequirementsService.getByName(reqName)
        .then(function (data) {
            console.log(data);
            $scope.dataModel.rawString = JSON.stringify(data, null, 2);
        })
        .catch(function (reason) {
            console.log(reason);
        });
});