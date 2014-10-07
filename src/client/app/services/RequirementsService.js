/*globals angular, console */
/**
 * Created by pmeijer on 10/6/2014.
 */

angular.module('RequirementsApp').service('RequirementsService', function ($q, $http, constants) {
    'use strict';
    var baseUrl = constants.baseUrl;
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