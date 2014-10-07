/**
 * Created by J on 10/7/2014.
 */

'use strict';
var main = function () {

    var fs = require('fs');
    var Classes = require('./classes');
    var args = process.argv.slice(2);
    var requirementsFilePath;
    var numberResultsToGenerate;
    var resultsShouldPass;

    if (args[0]) {
        requirementsFilePath = args[0];
    }
    if (args[1]) {
        numberResultsToGenerate = args[1];
    }
    if (args[2]) {
        if (args[2] === 'true') {
            resultsShouldPass = true;
        } else {
            resultsShouldPass = false;
        }
    }

    var giveMetricValues = function (metricInstance, requirementInstance, shouldPass) {
        var difference = Math.abs(requirementInstance.objective - requirementInstance.threshold);
        var average = (requirementInstance.objective + requirementInstance.threshold)/2;
        var randomNumber = Math.random();
        var unitScale = (randomNumber - 0.5);

        if (shouldPass) {
            metricInstance.Value = average + difference*unitScale;
        } else {
            metricInstance.Value = average + difference*1.5*unitScale;
        }
    };

    var generateTestBenchManifests = function (requirementsMap, designName, numberResults) {
        var testbenchJsons = {};
        var metricMap = {};
        var name;
        var numResults = numberResults || 1;

        for (name in requirementsMap) {
            var requirement = requirementsMap[name];
            var metricName = requirement.metricName;
            var metric;

            if (metricMap.hasOwnProperty(metricName)) {
                metric = metricMap[metricName];
            } else {
                metric = new Classes.Metric(requirement)
                metricMap[metricName] = metric;
            }

            for (var i=0;i<numResults;i++) {
                var tbName = requirement.testBench;
                //var tbName = requirement.testBench + "_" + (i + 1).toString();
                var dName = designName + "_" + (i + 1).toString();
                var uniqueName = tbName + '_' + dName;
                var tb;

                giveMetricValues(metric, requirement, resultsShouldPass);

                if (testbenchJsons.hasOwnProperty(uniqueName)) {
                    tb = testbenchJsons[uniqueName];
                } else {
                    tb = new Classes.TestBenchManifest(tbName, dName)
                    testbenchJsons[uniqueName] = tb;
                }

                // These two lines are to remove the reference to the "Metric" object.
                var metricString =JSON.stringify(metric, null, 4);
                var metricJson = JSON.parse(metricString);

                tb.Metrics.push(metricJson);
            }
        }

        for (name in testbenchJsons) {
            var fName = "testbench_manifest.json";
            //var dirName = 'z' + Math.random().toString(36).substring(8);
            fs.mkdir(name);
            fs.writeFile(name + '/' + fName, JSON.stringify(testbenchJsons[name], null, 4), function(err) {
                if(err) {
                    console.log(err);
                } else {
                    console.log("The file was saved!");
                }
            });
        }
    };

    var generateResultsFromRequirements = function (filePath) {
        fs.readFile(filePath, 'utf8', function(err, data) {
            if (err) {
                console.log("Could not read json file " + filePath);
            }

            data = JSON.parse(data);
            var splitPath = filePath.split('/'),
                title = splitPath[splitPath.length - 1].split('.')[0],
                flatRequirementsMap = {},
                requirements = new Classes.TopLevelRequirementsGroup(title, data, flatRequirementsMap);

            generateTestBenchManifests(flatRequirementsMap, "MyDesign", numberResultsToGenerate);
        });
    };

    generateResultsFromRequirements(requirementsFilePath);
};

if (require.main === module) {
    main();
}