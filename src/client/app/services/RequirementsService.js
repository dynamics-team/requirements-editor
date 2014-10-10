/*globals angular, console */
/**
 * Created by pmeijer on 10/6/2014.
 */

angular.module('RequirementsApp').service('RequirementsService', function ($q, $http, constants) {
    'use strict';
    var self = this,
        baseUrl = constants.baseUrl;
    console.log('RequirementsService');

    // Requirement functions
    this.listAllRequirements = function () {
        var deferred = $q.defer(),
            url = baseUrl + 'requirement/';
        $http.get(url)
            .success(function (data, status, headers, config) {
                var currentUser = headers()['x-user-id'],
                    i;
                for (i = 0; i < data.length; i += 1) {
                    data[i].permissionLevel = self.getPermissionLevel(currentUser, data[i]);
                }
                deferred.resolve(data);
            })
            .error(function (data, status, headers, config) {
                console.error(data);
                deferred.reject(status);
            });

        return deferred.promise;
    };

    this.getRequirementByTitle = function (title) {
        var deferred = $q.defer(),
            url = baseUrl + 'requirement/' + title;
        $http.get(url)
            .success(function (data, status, headers, config) {
                var currentUser = headers()['x-user-id'];
                data.permissionLevel = self.getPermissionLevel(currentUser, data);
                deferred.resolve(data);
            })
            .error(function (data, status, headers, config) {
                console.error(data);
                deferred.reject(status);
            });

        return deferred.promise;
    };

    this.addNewRequirement = function (data) {
        var deferred = $q.defer(),
            url = baseUrl + 'requirement/';
        $http.post(url, data)
            .success(function (data, status, headers, config) {
                deferred.resolve(data);
            })
            .error(function (data, status, headers, config) {
                console.error(data);
                deferred.reject(status);
            });

        return deferred.promise;
    };

    this.updateRequirement = function (title, reqData) {
        var deferred = $q.defer(),
            url = baseUrl + 'requirement/' + title;
        $http.put(url, reqData)
            .success(function (data, status, headers, config) {
                deferred.resolve(data);
            })
            .error(function (data, status, headers, config) {
                console.error(data);
                deferred.reject(status);
            });

        return deferred.promise;
    };

    this.deleteRequirementByTitle = function (title) {
        var deferred = $q.defer(),
            url = baseUrl + 'requirement/' + title;
        $http.delete(url)
            .success(function (data, status, headers, config) {
                deferred.resolve(data);
            })
            .error(function (data, status, headers, config) {
                console.error(data);
                deferred.reject(status);
            });

        return deferred.promise;
    };

    // Result/Scoring functions

    this.listAssociatedResults = function (reqTitle) {
        var deferred = $q.defer(),
            params = {params: {requirement: reqTitle}},
            url = baseUrl + 'result';
        $http.get(url, params)
            .success(function (data, status, headers, config) {
                var currentUser = headers()['x-user-id'],
                    i;
                for (i = 0; i < data.length; i += 1) {
                    data[i].permissionLevel = self.getPermissionLevel(currentUser, data[i]);
                }
                deferred.resolve(data);
            })
            .error(function (data, status, headers, config) {
                console.error(data);
                deferred.reject(status);
            });

        return deferred.promise;
    };

    this.deleteResultByName = function (resultName) {
        var deferred = $q.defer(),
            url = baseUrl + 'result/' + resultName;
        $http.delete(url)
            .success(function (data, status, headers, config) {
                deferred.resolve(data);
            })
            .error(function (data, status, headers, config) {
                console.error(data);
                deferred.reject(status);
            });

        return deferred.promise;
    };

    this.generateNewResults = function (reqTitle, n, shouldPass) {
        var deferred = $q.defer(),
            params = {params: {n: n, should_pass: shouldPass}},
            url = baseUrl + 'generate_results/' + reqTitle;
        $http.post(url, null, params)
            .success(function (data, status, headers, config) {
                deferred.resolve(data);
            })
            .error(function (data, status, headers, config) {
                console.error(data);
                deferred.reject(status);
            });

        return deferred.promise;
    };

    this.calculateScore = function (reqTitle, resultName) {
        var deferred = $q.defer(),
            params = {params: {requirement: reqTitle, result: resultName}},
            url = baseUrl + 'score';
        $http.get(url, params)
            .success(function (data, status, headers, config) {
                deferred.resolve(data);
            })
            .error(function (data, status, headers, config) {
                console.error(data);
                deferred.reject(status);
            });

        return deferred.promise;
    };

    // User functions
    this.getUsers = function () {
        var deferred = $q.defer(),
            url = baseUrl + 'user/';
        $http.get(url)
            .success(function (data, status, headers, config) {
                var currentUser = headers()['x-user-id'],
                    i;
                for (i = 0; i < data.length; i += 1) {
                    if (data[i].id === currentUser) {
                        data[i].current = true;
                        break;
                    }
                }
                deferred.resolve(data);
            })
            .error(function (data, status, headers, config) {
                console.error(data);
                deferred.reject(status);
            });

        return deferred.promise;
    };

    // Helper functions
    this.generateGuid = function () {
        var s4 = function () {
            return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
        };
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
    };

    this.jsonReplacer = function (key, value) {
        var illegals = {
            id: true,
            categoryId: true,
            isSelected: true,
            inSelections: true,
            isReq: true,
            flatRequirements: true,
            flatCategories: true,
            requirementDetails: true,
            $$hashKey: true,
            permissionLevel: true,
            score: true
        };
        if (illegals[key]) {
            return undefined;
        }
        if (key === 'weightNeg' || key === 'weightPos') {
            if (typeof value !== 'number') {
                value = 1;
            }
        }
        return value;
    };

    this.getPermissionLevel = function (userId, data) {
        var level = 0;
        if (data.auth_admin.indexOf(userId) > -1) {
            level = 3;
        } else if (data.auth_write.indexOf(userId) > -1) {
            level = 2;
        } else if (data.auth_read.indexOf(userId) > -1) {
            level = 1;
        } else {
            //console.warn('User did not have any permission for..', data);
        }

        return level;
    };

    // Get CAD URL
    this.getCadUrl = function (n) {
        var cadModels = ['cutter', 'part_FRONT_SHOCK_ASM', 'part_FRONT_WHEEL_ASM', 'T100-Thruster-R1-Public'],
            index = n % cadModels.length,
            modelName;
        modelName = cadModels[index];
        console.log(index, modelName);
        return baseUrl + '/app/#/cad.js/data/' + modelName + '/index.json';
    };
});