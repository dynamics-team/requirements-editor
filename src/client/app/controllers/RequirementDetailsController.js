/*globals angular, console*/
/**
 * Created by pmeijer on 10/6/2014.
 */

angular.module('RequirementsApp').controller('RequirementDetailsController', function (RequirementsService, $scope, $stateParams, $modal) {
    'use strict';
    var reqName = $stateParams.requirementId,
        replacer = function (key, value) { // This will be used to clean-up the ui data before posting to the data-base.
            var illegals = {
                id: true,
                categoryId: true,
                isSelected: true,
                inSelections: true,
                isReq: true,
                flatRequirements: true,
                flatCategories: true,
                requirementDetails: true,
                $$hashKey: true
            };
            if (illegals[key]) {
                return undefined;
            }
            return value;
        },
        flatten = function (children, parentId) {
            var i,
                id;
            for (i = 0; i < children.length; i += 1) {
                id = RequirementsService.generateGuid();
                children[i].id = id;
                children[i].categoryId = parentId;
                children[i].isSelected = false;
                children[i].inSelections = 0;
                if (children[i].hasOwnProperty('children')) {
                    $scope.dataModel.flatCategories[id] = children[i];
                    flatten(children[i].children, id);
                } else {
                    $scope.dataModel.flatRequirements[id] =  children[i];
                }
            }
        },
        refreshData = function () {
            $scope.dataModel.children = [];
            $scope.dataModel.flatRequirements = {};
            $scope.dataModel.flatCategories = {};
            RequirementsService.getByName(reqName)
                .then(function (data) {
                    console.log(data);
                    $scope.dataModel.children = data.children;
                    flatten(data.children);
                })
                .catch(function (reason) {
                    console.error('Could not get getByName', reason);
                });
        },
        categorySelectionChanged = function (children, toAdd) {
            var i;
            for (i = 0; i < children.length; i += 1) {
                if (children[i].hasOwnProperty('children')) {
                    categorySelectionChanged(children[i].children, toAdd);
                } else {
                    children[i].inSelections += toAdd;
                    if (children[i].inSelections < 0) {
                        console.error('My logic is bad inSelection is negative...', children[i]);
                    }
                }
            }
        };


    console.log('RequirementDetailsController');
    console.log(reqName);
    $scope.edit = function (data) {
        var modalInstance = $modal.open({
            templateUrl: 'templates/EditRequirement.html',
            controller: 'EditRequirementController',
            resolve: {
                data: function () {
                    return data;
                }
            }
        });

        modalInstance.result.then(function (returnData) {
            var key,
                jsonStr;
            for (key in returnData) {
                if (returnData.hasOwnProperty(key) && key !== 'isReq') {
                    data[key] = returnData[key];
                }
            }
            jsonStr = JSON.stringify($scope.dataModel, replacer, 0);
            console.log(jsonStr);
            console.log(JSON.parse(jsonStr));
            RequirementsService.postRequirement(jsonStr)
                .then(function (rData) {
                    console.log('Data-base updated with changes, rData:', rData);
                    refreshData();
                })
                .catch(function (reason) {
                    console.error('Could not save requirement', reason);
                });
        }, function () {
            console.log('Modal dismissed at: ' + new Date());
        });
    };

    $scope.duplicate = function (data) {
        var modalInstance,
            categoryId = data.categoryId;
        if (!categoryId) {
            console.warn('Cannot duplicate root category');
            return;
        }
        modalInstance = $modal.open({
            templateUrl: 'templates/EditRequirement.html',
            controller: 'EditRequirementController',
            resolve: {
                data: function () {
                    return data;
                }
            }
        });

        modalInstance.result.then(function (returnData) {
            console.warn(categoryId, returnData);
            // TODO: Save to data-base and then refresh data
        }, function () {
            console.log('Modal dismissed at: ' + new Date());
        });
    };

    $scope.dataModel = {
        title: reqName,
        children: [],
        flatRequirements: {},
        flatCategories: {},
        requirementDetails: false
    };

    $scope.onSelection = function (data) {
        var toAdd,
            categoryId,
            parent;
        data.isSelected = !data.isSelected;
        if (data.isSelected) {
            toAdd = 1;
        } else {
            toAdd = -1;
        }
        if (data.hasOwnProperty('children')) {
            categorySelectionChanged(data.children, toAdd);
        } else {
            categoryId = data.categoryId;
            while (categoryId) {
                parent = $scope.dataModel.flatCategories[categoryId];
                parent.inSelections += toAdd;
                if (parent.inSelections < 0) {
                    console.error('My logic is bad inSelection is negative...', parent);
                }
                categoryId = parent.categoryId;
            }
        }
    };

    refreshData();
});