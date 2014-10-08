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
            });
    })
    .run(function ($state) {
        'use strict';
        $state.go('requirements');
    });


// Include the Service
require('./services/RequirementsService');
// Include the controllers
require('./controllers/RequirementsController');
require('./controllers/RequirementDetailsController');
require('./controllers/EditRequirementController');