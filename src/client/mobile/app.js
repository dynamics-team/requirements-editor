/*globals console, window, angular, ionic*/

/**
 * @author lattmann / https://github.com/lattmann
 */

var ReqApp = angular.module('RequirementsApp', [
    'ui.router',
    'ionic',

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
    .run(function ($state, $ionicPlatform, constants) {
        'use strict';
        // TODO: Connect to database here, or at least check if REST is available?

        $ionicPlatform.ready(function() {
            // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
            // for form inputs)
            if(window.cordova && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
            }
            if(window.StatusBar) {
                StatusBar.styleDefault();
            }
        });

        console.log('Platform: ', ionic.Platform.platform());
        console.log('Constants: ', constants);
    });


require('./constants/constants.js');

// Include the Service
require('../app/services/RequirementsService');
// Include the controllers
require('../app/controllers/RequirementsController');
require('../app/controllers/RequirementDetailsController');

require('../app/controllers/RequirementsController');