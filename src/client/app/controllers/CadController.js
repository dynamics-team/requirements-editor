/*globals angular, console*/
/**
 * @author lattmann / https://github.com/lattmann
 */

angular.module('RequirementsApp').controller('CadController', function ($scope, $stateParams, constants) {
    'use strict';
    // TODO: in the future we should have an API for quering the available cad models
    var cadModels = ['cutter', 'part_FRONT_SHOCK_ASM', 'part_FRONT_WHEEL_ASM', 'T100-Thruster-R1-Public'],
        id = Math.floor(Math.random() * cadModels.length),
        requestedId = cadModels.indexOf($stateParams.resource),
        resourceToLoad;

    if (requestedId > -1) {
        resourceToLoad = $stateParams.resource;
    } else {
        // load a random one
        resourceToLoad = cadModels[id];
    }

    $scope.resource = '/lib/cad.js/public/?resource_url=/cad.js/data/' + resourceToLoad + '/index.json';

    console.log('Using cad model from: ', constants.baseUrl + $scope.resource);
});