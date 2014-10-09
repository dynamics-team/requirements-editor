/**
 * Created by J on 10/7/2014.
 */

'use strict';
var fs = require('fs');
var Classes = require('./classes');

function generateResults (requirementsObject, numberResults, resultsShouldPass) {
    var flatRequirementsMap = {},
    requirements = new Classes.TopLevelRequirementsGroup(requirementsObject, flatRequirementsMap);
    return generateTestBenchManifests(flatRequirementsMap, "MyDesign", numberResults, resultsShouldPass);
}

function generateTestBenchManifests (requirementsMap, seedDesignName, numberResults, resultsShouldPass) {
    var testbenchManifestGrid = {};
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
            var dName = seedDesignName + "_" + (i + 1).toString();
            var uniqueName = tbName + '_' + dName;
            var tb;

            giveMetricValues(metric, requirement, resultsShouldPass);

            if (testbenchManifestGrid.hasOwnProperty(dName)) {
                if (testbenchManifestGrid[dName].hasOwnProperty(tbName)) {
                    tb = testbenchManifestGrid[dName][tbName];
                } else {
                    tb = new Classes.TestBenchManifest(tbName, dName);
                    testbenchManifestGrid[dName][tbName] = tb;
                }
            } else {
                tb = new Classes.TestBenchManifest(tbName, dName);
                testbenchManifestGrid[dName] = {};
                testbenchManifestGrid[dName][tbName] = tb;
            }

            // These two lines are to remove the reference to the "Metric" object.
            var metricString =JSON.stringify(metric, null, 4);
            var metricJson = JSON.parse(metricString);

            tb.Metrics.push(metricJson);
        }
    }

    var results = [];

    for (dName in testbenchManifestGrid) {
        var singleResult = [];
        for (tbName in testbenchManifestGrid[dName]) {
            singleResult.push(testbenchManifestGrid[dName][tbName]);
        }

        results.push(singleResult);
    }

    return results;
}

function giveMetricValues (metricInstance, requirementInstance, shouldPass) {
    var difference = Math.abs(requirementInstance.objective - requirementInstance.threshold),
        average = (requirementInstance.objective + requirementInstance.threshold)/ 2,
        randomNumber = Math.random(),
        unitScale = (randomNumber - 0.5);

    if (shouldPass) {
        metricInstance.Value = average + difference*unitScale;
    } else {
        if (Math.random() < 0.9) {
            metricInstance.Value = average + 1.1*difference*unitScale;
        } else {
            metricInstance.Value = null;
        }
    }

}

function saveFile(tbManifestObject) {
    var uniqueName = tbManifestObject.DesignName + '_' + tbManifestObject.TestBench;
    fs.mkdirSync(uniqueName);
    fs.writeFileSync(uniqueName + '/testbench_manifest.json', JSON.stringify(tbManifestObject, null, 4));
}

var main = function () {

    var args = process.argv.slice(2),
        requirementsFilePath,
        numberResultsToGenerate;

    if (args[0]) {
        requirementsFilePath = args[0];
    }
    if (args[1]) {
        numberResultsToGenerate = args[1];
    }

    fs.readFile(requirementsFilePath, 'utf8', function(err, data) {
        if (err) {
            console.log("Could not read json file " + filePath);
        }

        var requirementsObject = JSON.parse(data);
            //splitPath = requirementsFilePath.split('/'),
            //title = splitPath[splitPath.length - 1].split('.')[0],

        var result = generateResults(requirementsObject, numberResultsToGenerate);

        for (var i=0;i<result.length;i++) {
            for (var j=0;j<result[i].length;j++) {
                saveFile(result[i][j]);
            }
        }
    });
};

if (require.main === module) {
    main();
}

module.exports.generateResults = generateResults;