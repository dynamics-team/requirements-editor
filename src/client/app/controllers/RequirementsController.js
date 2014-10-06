/*globals angular, console*/
/**
 * Created by pmeijer on 10/6/2014.
 */

angular.module('RequirementsApp').controller('RequirementsController', function (RequirementsService, $scope) {
    'use strict';
    $scope.dataModel = {
        requirements: []
    };
    console.log('RequirementsController');
    $scope.navigateToReq = function (reqName) {
        RequirementsService.getByName(reqName)
            .then(function (data) {
                console.log(data);
                alert(JSON.stringify(data, null, 2));
            })
            .catch(function (reason) {
                console.log(reason);
            });
    };
    RequirementsService.listAll()
        .then(function (data) {
            console.log(data);
            $scope.dataModel.requirements = data;
        })
        .catch(function (reason) {
            console.log(reason);
        });
});