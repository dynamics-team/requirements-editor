/*globals angular, console*/
/**
 * Created by pmeijer on 10/6/2014.
 */

angular.module('RequirementsApp').controller('RequirementsController', function (RequirementsService, $scope) {
    'use strict';
    var refreshData = function () {
        $scope.dataModel.requirements = [];
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

    $scope.create = function () {
        var newReq = {
            title: 'NewTest2',
            children: [ {
                "name": "Movement",
                "weightNeg": 1,
                "description": "Performance of the Vehicle Movement",
                "weightPos": 1,
                "Priority": 1,
                "children": [ {
                    "weightNeg": 1,
                    "name": "Speed",
                    "description": "Speed and Accelerations",
                    "weightPos": 1,
                    "Priority": 1,
                    "children": [{
                        "KPP": true,
                        "function": "f(x)",
                        "weightNeg": 0.5,
                        "name": "Acc20kph Full Throttle",
                        "weightPos": 0.555556,
                        "description": "Time to reach 20kph on flat ground.",
                        "Priority": 1,
                        "objective": 11,
                        "testBench": "FullSpeedForward",
                        "threshold": 13,
                        "unit": "s",
                        "metricName": "Acc20kph"
                    },
                        {
                            "KPP": true,
                            "function": "g(x)",
                            "weightNeg": 0.7,
                            "name": "Acc40kph Full Throttle",
                            "weightPos": 0.3,
                            "description": "Time to reach 40kph on flat ground.",
                            "Priority": 1,
                            "objective": 17,
                            "testBench": "FullSpeedForward",
                            "threshold": 25,
                            "unit": "s",
                            "metricName": "Acc40kph"
                        }]
                }]
            }]
        };
        RequirementsService.addNewRequirement(JSON.stringify(newReq, null, 0))
            .then(function (rData) {
                console.log('Data-base updated with changes, rData:', rData);
                refreshData();
            })
            .catch(function (reason) {
                console.error('Could not save requirement', reason);
            });
    };

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