/*globals angular, ionic*/
/**
 * @author lattmann / https://github.com/lattmann
 */

var hostname = 'localhost';

if (ionic.Platform.platform() === 'android') {
    hostname = '10.0.2.2';
}

angular.module('RequirementsApp').constant('constants', {
    baseUrl: 'http://' + hostname + ':8844/'
});