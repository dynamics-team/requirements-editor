/*globals angular, console, window, require*/

var ReqApp = angular.module('RequirementsApp', [])
    .controller('RequirementsController', function (RequirementsService, $scope) {
        'use strict';
        $scope.dataModel = {
            requirements: []
        };
        console.log('RequirementsController');
        $scope.navigateToReq = function (reqName) {
            RequirementsService.getByName(reqName)
                .then(function (data) {
                    console.log(data);
                    alert(JSON.stringify(data, null, 2));
                })
                .catch(function (reason) {
                    console.log(reason);
                });
        }
        RequirementsService.listAll()
            .then(function (data) {
                console.log(data);
                $scope.dataModel.requirements = data;
            })
            .catch(function (reason) {
                console.log(reason);
            });
    })
    .service('RequirementsService', function ($q, $http) {
        'use strict';
        var baseUrl = 'http://localhost:8844/'; // TODO: This should probably be configurable
        console.log('RequirementsService');

        this.listAll = function () {
            var deferred = $q.defer(),
                url = baseUrl + 'requirement/';
            $http.get(url)
                .success(function (data, status, headers, config) {
                    deferred.resolve(data);
                })
                .error(function (data, status, headers, config) {
                    console.error(data);
                    deferred.reject(status);
                });

            return deferred.promise;
        };

        this.getByName = function (name) {
            var deferred = $q.defer(),
                url = baseUrl + 'requirement/' + name;
            $http.get(url)
                .success(function (data, status, headers, config) {
                    deferred.resolve(data);
                })
                .error(function (data, status, headers, config) {
                    console.error(data);
                    deferred.reject(status);
                });

            return deferred.promise;
        };
    });

