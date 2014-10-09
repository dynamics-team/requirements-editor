/*globals angular, console, window, require*/

var ReqApp = angular.module('RequirementsApp', [
    'ui.router',
    'ui.bootstrap',

    'requirements.editor.config',
    'requirements.editor.templates'
])
    .config(function ($stateProvider, $urlRouterProvider) {
        'use strict';
        // For any unmatched url, redirect to /workspaces
        $urlRouterProvider.otherwise('/index');
        //
        // Now set up the states
        $stateProvider
            .state('index', {
                url: "/index"
            })
            .state('requirements', {
                url: "/requirements",
                templateUrl: "templates/Requirements.html",
                controller: "RequirementsController"
            })
            .state('requirementDetails', {
                url: "/requirementDetails/:requirementId",
                templateUrl: "templates/RequirementDetails.html",
                controller: "RequirementDetailsController"
            })
            // FIXME: put controller template to its own file
            .state('cad', {
                url: "/cad.js/data/:resource/index.json",
                template: '<div style="position:absolute; left: 0; right: 0; bottom: 0; top: 0px;"><iframe src="{{ resource }}" width="100%" height="100%"></iframe></div>',
                controller: function ($scope, $stateParams) {
                    $scope.resource = '/lib/cad.js/public/?resource_url=/cad.js/data/' + $stateParams.resource + '/index.json';
                }
            });
    })
    .run(function ($state) {
        'use strict';
        $state.go('requirements');
    });

require('./angularRequire');
