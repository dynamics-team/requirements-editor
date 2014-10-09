/*globals angular, console*/
/**
 * Created by pmeijer on 10/8/2014.
 */

angular.module('RequirementsApp').controller('EditUsersController', function ($scope, $modalInstance, RequirementsService, data) {
    'use strict';
    $scope.dataModel = {
        title: data.title,
        users: {}
    };

    RequirementsService.getUsers().
        then(function (users) {
            var id,
                i;
            for (i = 0; i < users.length; i += 1) {
                if (!users[i].current) {
                    id = users[i].id;
                    $scope.dataModel.users[id] = {
                        id: id,
                        name: users[i].displayName,
                        permissionLevel: RequirementsService.getPermissionLevel(id, data)
                    };
                }
            }
        });

    $scope.ok = function () {
        //TODO: Update the requirement user info.
        $modalInstance.close($scope.dataModel);
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
});