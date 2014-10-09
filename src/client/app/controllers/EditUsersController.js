/*globals angular, console*/
/**
 * Created by pmeijer on 10/8/2014.
 */

angular.module('RequirementsApp').controller('EditUsersController', function ($scope, $modalInstance, RequirementsService, data) {
    'use strict';
    var currentUser;
    $scope.dataModel = {
        title: data.title,
        users: {}
    };

    RequirementsService.getUsers().
        then(function (users) {
            var id,
                i;
            for (i = 0; i < users.length; i += 1) {
                if (users[i].current) {
                    currentUser = users[i].id;
                } else {
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
        var key,
            user,
            userData = {
                title: data.title,
                auth_admin: [currentUser],
                auth_write: [currentUser],
                auth_read: [currentUser]
            };

        for (key in $scope.dataModel.users) {
            if ($scope.dataModel.users.hasOwnProperty(key)) {
                user = $scope.dataModel.users[key];
                if (user.permissionLevel > 2) {
                    userData.auth_admin.push(user.id);
                }
                if (user.permissionLevel > 1) {
                    userData.auth_write.push(user.id);
                }
                if (user.permissionLevel > 0) {
                    userData.auth_read.push(user.id);
                }
            }
        }
        $modalInstance.close(userData);
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
});