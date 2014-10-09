/*globals console, window, angular, ionic*/

/**
 * @author lattmann / https://github.com/lattmann
 */

var ReqApp = angular.module('RequirementsApp', [
    'ui.router',
    'ui.bootstrap',
    'ionic',

    'requirements.editor.config',
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

            .state('tab.scoring', {
                url: '/scoring',
                views: {
                    'tab-scoring': {
                        templateUrl: 'templates/Scoring.html',
                        controller: function ($scope) {
                            console.error('No controller yet.');
                        }
                    }
                }
            })

            .state('tab.users', {
                url: '/users',
                views: {
                    'tab-users': {
                        templateUrl: 'templates/Users.html',
                        controller: 'UsersController'
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
    .run(function ($state, $ionicPlatform, constants, $http, $q) {
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

        if (window.location.origin + '/' !== constants.baseUrl) {
            // redirect
            window.location = constants.baseUrl;
        }


//        var generate_results = function (requirement_id, num) {
//            var deferred = $q.defer(),
//                url = constants.baseUrl + 'generate_results/' + requirement_id + '?n=' + (num || 1);
//            $http.post(url)
//                .success(function (data, status, headers, config) {
//                    deferred.resolve(data);
//                })
//                .error(function (data, status, headers, config) {
//                    console.error(data);
//                    deferred.reject(status);
//                });
//
//            return deferred.promise;
//        };
//        generate_results('asdf', 3);
    });


ReqApp.controller('DebugController', function ($scope) {
    $scope.window = window;
    $scope.platform = ionic.Platform.platform();
    $scope.device = ionic.Platform.device();
});

// Include app dependencies
require('../app/angularRequire');

