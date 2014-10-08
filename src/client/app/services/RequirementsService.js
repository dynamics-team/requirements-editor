/*globals angular, console */
/**
 * Created by pmeijer on 10/6/2014.
 */

angular.module('RequirementsApp').service('RequirementsService', function ($q, $http, constants) {
    'use strict';
    var self = this,
        baseUrl = constants.baseUrl;
    console.log('RequirementsService');

    this.listAll = function () {
        var deferred = $q.defer(),
            url = baseUrl + 'requirement/';
        $http.get(url)
            .success(function (data, status, headers, config) {
                var currentUser = headers()['x-user-id'],
                    i;
                for (i = 0; i < data.length; i += 1) {
                    data[i].permissionLevel = self._getPermissionLevel(currentUser, data[i]);
                }
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
                var currentUser = headers()['x-user-id'];
                data.permissionLevel = self._getPermissionLevel(currentUser, data);
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

    this.getUsers = function () {
        var deferred = $q.defer(),
            url = baseUrl + 'user/';
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

    this.deleteByName = function (name) {
        var deferred = $q.defer(),
            url = baseUrl + 'requirement/' + name;
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
            permissionLevel: true
        };
        if (illegals[key]) {
            return undefined;
        }
        return value;
    };

    this._getPermissionLevel = function (currentUser, data) {
        var level = 0;
        if (data.auth_admin.indexOf(currentUser) > -1) {
            level = 3;
        } else if (data.auth_write.indexOf(currentUser) > -1) {
            level = 2;
        } else if (data.auth_read.indexOf(currentUser) > -1) {
            level = 1;
        } else {
            console.warn('User did not have any permission for..', data);
        }

        return level;
    };
});