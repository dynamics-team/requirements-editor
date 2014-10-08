/*globals angular, console*/
/**
 * Created by pmeijer on 10/6/2014.
 */

angular.module('RequirementsApp').controller('RequirementDetailsController', function (RequirementsService, $scope, $stateParams, $modal) {
    'use strict';
    var reqName = $stateParams.requirementId,
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
            jsonStr = JSON.stringify({children: $scope.dataModel.children}, RequirementsService.jsonReplacer, 0);
            console.log(jsonStr);
            console.log(JSON.parse(jsonStr));
            RequirementsService.updateRequirement($scope.dataModel.title, jsonStr)
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
            isCategory = data.hasOwnProperty('children'),
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
            var category,
                jsonStr;
            if (isCategory) {
                returnData.children = [];
            }
            category = $scope.dataModel.flatCategories[categoryId];
            console.log('Found parent category', category);
            category.children.push(returnData);
            jsonStr = JSON.stringify({children: $scope.dataModel.children}, RequirementsService.jsonReplacer, 0);
            console.log(jsonStr);
            console.log(JSON.parse(jsonStr));
            RequirementsService.updateRequirement($scope.dataModel.title, jsonStr)
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

    $scope.createNew = function (categoryData, isReq) {
        var defaultData = {
            name: '',
            description: 'Give a description',
            weightNeg: 1,
            weightPos: 1,
            Priority: 1,
            categoryId: categoryData.id
        };
        if (isReq) {
            defaultData.KPP = false;
            defaultData.function = 'LIN';
            defaultData.objective = 1;
            defaultData.threshold = 0;
            defaultData.unit = 'unitless';
            defaultData.metricName = '';
            defaultData.testBench = '';
        } else {
            defaultData.children = [];
        }
        $scope.duplicate(defaultData);
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