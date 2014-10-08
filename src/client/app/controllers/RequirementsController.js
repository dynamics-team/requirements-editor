/*globals angular, console*/
/**
 * Created by pmeijer on 10/6/2014.
 */

angular.module('RequirementsApp').controller('RequirementsController', function (RequirementsService, $scope, $modal) {
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
        },
        promptNewRequirement = function (defaultData) {
            var modalInstance;
            modalInstance = $modal.open({
                templateUrl: 'templates/NewRequirement.html',
                controller: 'NewRequirementController',
                resolve: {
                    data: function () {
                        return {
                            name: defaultData.title
                        };
                    }
                }
            });
            modalInstance.result.then(function (newReq) {
                defaultData.title = newReq.name;
                //TODO: Add the users...
                RequirementsService.addNewRequirement(JSON.stringify(defaultData, RequirementsService.jsonReplacer, 0))
                    .then(function (rData) {
                        console.log('Data-base updated with changes, rData:', rData);
                        refreshData();
                    })
                    .catch(function (reason) {
                        if (reason === 409) {
                            console.warn('Name already existed in data-base..Could be from another user.');
                            promptNewRequirement({name: 'Name already existed in data-base..'});
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
                "children": []
            }]
        });
    };

    $scope.duplicate = function (currTitle) {
        RequirementsService.getByName(currTitle)
            .then(function (data) {
                console.log('about ot duplicate', data);
                delete data.title;
                promptNewRequirement(data);
            })
            .catch(function (reason) {
                console.error('Could not get getByName', reason);
            });
    };
});