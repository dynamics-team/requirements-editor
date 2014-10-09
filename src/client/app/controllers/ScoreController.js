/*globals angular, console*/
/**
 * Created by pmeijer on 10/8/2014.
 */

angular.module('RequirementsApp').controller('ScoreController', function ($scope, $modalInstance, RequirementsService, data) {
    'use strict';
    var title = data.title;
    $scope.dataModel = {
        title: data.title,
        results: []
    };

    $scope.generateResults = function (n) {
        RequirementsService.generateNewResults(title, n)
            .then(function (data) {
                console.log('gen-data', data);
                RequirementsService.listAssociatedResults(title)
                    .then(function (data) {
                        console.log('list-results', data);
                    })
                    .catch(function (reason) {
                        console.error('Could not list results', reason);
                    });
            })
            .catch(function (reason) {
                console.error('Could not generate new results', reason);
            });
    };

    $scope.ok = function () {
        $modalInstance.close($scope.dataModel);
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
});