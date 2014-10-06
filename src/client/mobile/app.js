/*globals console, window*/

var ReqApp = angular.module('RequirementsApp', [
    'ui.router',
    'ionic'

    // TODO: add templates include
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
            });
//            .state('requirements', {
//                url: "/requirements",
//                templateUrl: "/views/Requirements.html",
//                controller: "RequirementsController"
//            });
//            .state('requirementDetails', {
//                url: "/requirements/:requirementId",
//                templateUrl: "/views/RequirementDetails.html",
//                controller: "RequirementDetailsController"
//            });
    })
    .run(function ($state, $ionicPlatform) {
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
    });


require('../app/services/RequirementsService');

require('../app/controllers/RequirementsController');