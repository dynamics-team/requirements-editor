/*globals angular, console*/
/**
 * @author lattmann / https://github.com/lattmann
 */

angular.module('RequirementsApp').controller('UsersController', function ($scope, RequirementsService) {
    'use strict';
    var currentUser;
    $scope.dataModel = {
        users: {},
        currentUserId: null
    };

    // TODO: how frequently should we refresh this?
    RequirementsService.getUsers().
        then(function (users) {
            var id,
                i;
            for (i = 0; i < users.length; i += 1) {
                if (users[i].current) {
                    currentUser = users[i].id;
                    $scope.dataModel.currentUserId = currentUser;
                }

                id = users[i].id;
                $scope.dataModel.users[id] = {
                    id: id,
                    name: users[i].displayName
                };
            }
        });
});