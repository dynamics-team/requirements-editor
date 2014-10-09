/*globals angular, console */
/**
 * @author lattmann / https://github.com/lattmann
 */


angular.module('RequirementsApp').service('SearchService', function ($q, $http, constants) {
    'use strict';
    var self = this,
        baseUrl = constants.baseUrl;
    console.log('RequirementsService');

    this.search = function (search_query, page, perPage) {
        var deferred = $q.defer(),
            url = baseUrl + 'search/?q=' + encodeURIComponent(search_query);

        page = parseInt(page);
        perPage = parseInt(perPage);

        if (page < 1) {
            page = 1;
        }

        if (page) {
            url += '&page=' + page;
        }

        if (perPage) {
            url += '&per_page=' + perPage;
        }

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