/*globals angular, console, window, require*/

var ReqApp = angular.module('RequirementsApp', [
    'ui.router',

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
                templateUrl: "/requirements-editor/templates/Requirements.html",
                controller: "RequirementsController"
            });
//            .state('requirementDetails', {
//                url: "/requirements/:requirementId",
//                templateUrl: "/views/RequirementDetails.html",
//                controller: "RequirementDetailsController"
//            });
    })
    .run(function ($state) {
        'use strict';
        // TODO: Connect to database here, or at least check if REST is avaliable?
    });

require('./services/RequirementsService');

require('./controllers/RequirementsController');
//require('./views/RequirementDetails.html');