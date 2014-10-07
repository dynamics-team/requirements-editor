/*globals angular, console*/
/**
 * Created by pmeijer on 10/6/2014.
 */

angular.module('RequirementsApp').controller('RequirementsController', function (RequirementsService, $scope) {
    'use strict';
    var refreshData = function () {
        RequirementsService.listAll()
            .then(function (data) {
                console.log(data);
                $scope.dataModel.requirements = data;
            })
            .catch(function (reason) {
                console.log(reason);
            });
    };
    $scope.dataModel = {
        requirements: []
    };
    console.log('RequirementsController');
    refreshData();

    $scope.duplicate = function (currTitle) {
        RequirementsService.getByName(currTitle)
            .then(function (data) {
//                data.title = currTitle + '(Copy)';
//
//                data.author = null;
//                data.auth_admin = null;
//                data.auth_write = null;
//                data.auth_read = null;

                console.log(JSON.stringify(data, null, 2));
//                RequirementsService.postRequirement(data)
//                    .then(function (data) {
//                        refreshData();
//                    });
            });
    };
});