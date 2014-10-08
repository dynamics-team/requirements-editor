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

    this.deleteByName = function (name) {
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

    this.generateGuid = function () {
        var s4 = function () {
            return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
        };
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
    };
});