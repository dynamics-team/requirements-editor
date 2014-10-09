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

    RequirementsService.listAssociatedResults(title)
        .then(function (resData) {
            var i;
            for (i = 0; i < resData.length; i += 1) {
                $scope.dataModel.results.push({
                    name: resData[i].name,
                    score: ''
                });
            }
        })
        .catch(function (reason) {
            console.error('Could not list results', reason);
        });

    $scope.generateResults = function (n) {
        RequirementsService.generateNewResults(title, n)
            .then(function (newResData) {
                var i;
                for (i = 0; i < newResData.length; i += 1) {
                    $scope.dataModel.results.push({
                        name: newResData[i],
                        score: ''
                    });
                }
            })
            .catch(function (reason) {
                console.error('Could not generate new results', reason);
            });
    };

    $scope.deleteItem = function (index) {
        var res = $scope.dataModel.results[index];
        RequirementsService.deleteResultByName(res.name)
            .then(function (rData) {
                console.log('Deleted result', rData);
                $scope.dataModel.results.splice(index, 1);
            })
            .catch(function (reason) {
                console.error('Could not delete result', reason, res);
            });
    };

    $scope.scoreResult = function (res) {
        RequirementsService.calculateScore(title, res.name)
            .then(function (rData) {
                console.log('Scored result', res, rData);
            })
            .catch(function (reason) {
                console.error('Could not score result', res, reason);
            });
    };

    $scope.ok = function () {
        $modalInstance.close($scope.dataModel);
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
});