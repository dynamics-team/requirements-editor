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
        // For any unmatched url, redirect to /tab/requirements
        $urlRouterProvider.otherwise('/tab/requirements');

        $stateProvider
            // setup an abstract state for the tabs directive
            .state('tab', {
                url: '/tab',
                abstract: true,
                templateUrl: 'templates/Tabs.html'
            })

            // Each tab has its own nav history stack:

            .state('tab.requirements', {
                url: '/requirements',
                views: {
                    'tab-requirements': {
                        templateUrl: 'templates/Requirements.html',
                        controller: 'RequirementsController'
                    }
                }
            })

            .state('tab.requirement-detail', {
                url: '/requirements/:requirementId',
                views: {
                    'tab-requirements': {
                        templateUrl: 'templates/RequirementDetails.html',
                        controller: 'RequirementDetailsController'
                    }
                }
            })

            .state('tab.search', {
                url: '/search',
                views: {
                    'tab-search': {
                        templateUrl: 'templates/Search.html',
                        controller: 'SearchController'
                    }
                }
            });
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


ReqApp.controller('SearchController', function ($scope) {
    $scope.results = [
        {
            name: 'rq 1',
            type: 'requirement'
        },
        {
            name: 'score result 1',
            type: 'score'
        },
        {
            name: 'rq 2',
            type: 'requirement'
        },
        {
            name: 'test result 12',
            type: 'test'
        }
    ];
});

// Include the Service
require('../app/services/RequirementsService');
// Include the controllers
require('../app/controllers/RequirementsController');
require('../app/controllers/RequirementDetailsController');

require('../app/controllers/RequirementsController');