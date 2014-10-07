/*globals angular, console*/
/**
 * Created by pmeijer on 10/6/2014.
 */

angular.module('RequirementsApp').controller('RequirementDetailsController', function (RequirementsService, $scope, $stateParams) {
    'use strict';
    var reqName = $stateParams.requirementId,
        getIdFcn = function (id) {
            return function () {
                return id;
            };
        },
        flatten = function (children, parentId) {
            var i,
                id;
            for (i = 0; i < children.length; i += 1) {
                id = RequirementsService.generateGuid();
                children[i].getId = getIdFcn(id);
                children[i].getCategoryId = getIdFcn(parentId);
                if (children[i].hasOwnProperty('children')) {
                    $scope.dataModel.flatCategories[id] = children[i];
                    flatten(children[i].children, id);
                } else {
                    $scope.dataModel.flatRequirements[id] =  children[i];
                }
            }
        };

    console.log('RequirementDetailsController');
    console.log(reqName);

    $scope.dataModel = {
        title: reqName,
        children: [],
        flatRequirements: {},
        flatCategories: {}
    };

    RequirementsService.getByName(reqName)
        .then(function (data) {
            console.log(data);
            $scope.dataModel.children = data.children;
            flatten(data.children);
        })
        .catch(function (reason) {
            console.log(reason);
        });
});