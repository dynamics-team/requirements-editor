/*globals angular, console */
/**
 * @author lattmann / https://github.com/lattmann
 */


angular.module('RequirementsApp').service('SearchService', function ($q, $http, constants) {
    'use strict';
    var self = this,
        baseUrl = constants.baseUrl;
    console.log('RequirementsService');

    this.search = function (search_query) {
        var deferred = $q.defer(),
            url = baseUrl + 'search/?search_query=' + search_query;
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