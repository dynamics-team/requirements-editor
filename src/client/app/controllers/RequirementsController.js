/*globals angular, console*/
/**
 * Created by pmeijer on 10/6/2014.
 */

angular.module('RequirementsApp').controller('RequirementsController', function (RequirementsService, $scope, $modal) {
    'use strict';
    var refreshData = function () {
            $scope.dataModel.requirements = [];
            RequirementsService.listAllRequirements()
                .then(function (data) {
                    console.log(data);
                    $scope.dataModel.requirements = data;
                })
                .catch(function (reason) {
                    console.log(reason);
                });
        },
        promptNewRequirement = function (defaultData) {
            var modalInstance;
            modalInstance = $modal.open({
                templateUrl: 'templates/NewRequirement.html',
                controller: 'NewRequirementController',
                resolve: {
                    data: function () {
                        return {
                            title: defaultData.title
                        };
                    }
                }
            });
            modalInstance.result.then(function (newReq) {
                defaultData.title = newReq.title;
                RequirementsService.addNewRequirement(JSON.stringify(defaultData, RequirementsService.jsonReplacer, 0))
                    .then(function (rData) {
                        console.log('Data-base updated with changes, rData:', rData);
                        refreshData();
                    })
                    .catch(function (reason) {
                        if (reason === 409) {
                            console.warn('Title already existed in data-base.. (Could be from another user.)');
                            promptNewRequirement({title: 'Title already existed in data-base..'});
                        } else {
                            console.error('Something went really wrong..');
                        }
                    });
            }, function () {
                console.log('Modal dismissed at: ' + new Date());
            });
        };

    $scope.dataModel = {
        requirements: []
    };
    console.log('RequirementsController');
    refreshData();

    $scope.create = function () {
        promptNewRequirement({
            children: [{
                "name": "RootCategory",
                "weightNeg": 1,
                "description": "Some description",
                "weightPos": 1,
                "Priority": 1,
                "children": [
                    {
                        "metricName": "MetricName",
                        "unit": "kg",
                        "threshold": 0,
                        "testBench": "TestBench",
                        "objective": 1,
                        "Priority": 1,
                        "description": "Description",
                        "weightPos": 1,
                        "name": "Name",
                        "weightNeg": 1,
                        "function": "",
                        "KPP": false
                    }
                ]
            }]
        });
    };

    $scope.duplicate = function (currTitle) {
        RequirementsService.getRequirementByTitle(currTitle)
            .then(function (data) {
                console.log('about ot duplicate', data);
                delete data.title;
                promptNewRequirement(data);
            })
            .catch(function (reason) {
                console.error('Could not get getByName', reason);
            });
    };

    $scope.deleteItem = function (title) {
        RequirementsService.deleteRequirementByTitle(title)
            .then(function (data) {
//                console.log('deleteed', data);
//                console.log('delete', $scope.dataModel.requirements);
                refreshData();
            })
            .catch(function (reason) {
                console.log(reason);
            });
    };

    $scope.editUsers = function (data) {
        var modalInstance;
        modalInstance = $modal.open({
            templateUrl: 'templates/EditUsers.html',
            controller: 'EditUsersController',
            resolve: {
                data: function () {
                    return data;
                }
            }
        });

        modalInstance.result.then(function (users) {
            var jsonStr = JSON.stringify(users, RequirementsService.jsonReplacer, users);
            RequirementsService.updateRequirement(users.title, jsonStr)
                .then(function (rData) {
                    console.log('Data-base updated with user changes, rData:', rData);
                    refreshData();
                })
                .catch(function (reason) {
                    console.error('Could not update users', reason);
                });
        }, function () {
            console.log('Modal dismissed at: ' + new Date());
        });
    };
});