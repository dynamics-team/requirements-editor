/*globals angular, console*/
/**
 * Created by pmeijer on 10/8/2014.
 */

angular.module('RequirementsApp').controller('ScoreController', function ($scope, $modalInstance, RequirementsService, data) {
    'use strict';
    var title = data.title;
    $scope.dataModel = {
        title: data.title,
        permissionLevel: data.permissionLevel,
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
        RequirementsService.generateNewResults(title, n, false)
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

    $scope.scoreAll = function () {
        var i;
        for (i = 0; i < $scope.dataModel.results.length; i += 1) {
            $scope.scoreResult($scope.dataModel.results[i]);
        }
    };

    $scope.scoreResult = function (res) {
        RequirementsService.calculateScore(title, res.name)
            .then(function (rData) {
                console.log('Scored result', res, rData);
                if (rData.score === null) {
                    res.score = { score: 'Corrupt result/requirement!'};
                } else {
                    res.score = rData;
                }
            })
            .catch(function (reason) {
                console.error('Could not score result', res, reason);
            });
    };

//    $scope.ok = function () {
//        $modalInstance.close($scope.dataModel);
//    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };

    $scope.viewDetails = function (result) {
        $modalInstance.close(result.score);
    };
});