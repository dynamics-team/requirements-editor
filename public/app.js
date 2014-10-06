/*globals angular, console, window, require*/

var ReqApp = angular.module('RequirementsApp', [])
    .controller('RequirementsController', function (RequirementsService, $scope) {
        'use strict';
        $scope.dataModel = {
            all: []
        };
        console.log('RequirementsController');
        $scope.dataModel.all = RequirementsService.listRequirements();
    })
    .service('RequirementsService', function () {
        'use strict';
        console.log('RequirementsService');

        this.listRequirements = function () {
            return ['req1', 'req2'];
        };
    });

