/**
 * Created by J on 10/7/2014.
 */

//define(['classes'], function (Classes) {});

var main = function () {
    'use strict';

    var fs = require('fs');
    var requirementsFilePath = process.argv[2];

    var giveMetricValues = function (metricInstance, requirementInstance, shouldPass) {
        var difference = Math.abs(requirementInstance.objective - requirementInstance.threshold);
        var average = (requirementInstance.objective + requirementInstance.threshold)/2;
        var randomNumber = Math.random();
        var unitScale = (randomNumber - 0.5);
//        metricInstance.objective = requirementInstance.objective;
//        metricInstance.threshold = requirementInstance.threshold;
//        metricInstance.shouldPass = shouldPass;
//        metricInstance.average = average;
//        metricInstance.difference = difference;

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

        for (name in requirementsMap) {
            var requirement = requirementsMap[name];
            var metricName = requirement.metricName;
            var metric;

            if (metricMap.hasOwnProperty(metricName)) {
                metric = metricMap[metricName];
            } else {
                metric = new Metric(requirement)
                metricMap[metricName] = metric;
            }

            for (var i=0;i<numberResults;i++) {
                var tbName = requirement.testBench + "_" + (i + 1).toString();
                var dName = designName + "_" + (i + 1).toString();
                var tb;

                giveMetricValues(metric, requirement, true);

                if (testbenchJsons.hasOwnProperty(tbName)) {
                    tb = testbenchJsons[tbName];
                } else {
                    tb = new TestbenchManifest(tbName, dName)
                    testbenchJsons[tbName] = tb;
                }

                // These two lines are to remove the reference to the "Metric" object.
                var metricString =JSON.stringify(metric, null, 4);
                var metricJson = JSON.parse(metricString);

                tb.Metrics.push(metricJson);
            }
        }

        for (name in testbenchJsons) {
            var fName = name + ".json";
            fs.writeFile(fName, JSON.stringify(testbenchJsons[name], null, 4), function(err) {
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
                requirements = new TopLevelRequirementsGroup(title, data, flatRequirementsMap);

            generateTestBenchManifests(flatRequirementsMap, "MyDesign", 5);
        });
    };

    generateResultsFromRequirements(requirementsFilePath);

    function TopLevelRequirementsGroup(title, data, requirementsMap) {

        this.title = title;
        if (data.hasOwnProperty('weightNeg')) {
            this.weightNeg = data.weightNeg;
        } else {
            this.weightNeg = 1.0;
        }
        if (data.hasOwnProperty('description')) {
            this.description = data.description;
        } else {
            this.description = "Full-length, detailed description";
        }
        if (data.hasOwnProperty('weightPos')) {
            this.weightPos = data.weightPos;
        } else {
            this.weightPos = 1.0;
        }
        if (data.hasOwnProperty('Priority')) {
            this.Priority = data.Priority;
        } else {
            this.Priority = 1;
        }

        this.children = [];
        if (data.hasOwnProperty('children')) {
            for (var i=0; i<data.children.length; i++) {
                if (data.children[i].hasOwnProperty('KPP')) {
                    var newRequirementObject = new Requirement(data.children[i]);
                    requirementsMap[newRequirementObject.name] = newRequirementObject;
                    this.children.push(newRequirementObject);

                } else {
                    this.children.push(new RequirementsGroup(data.children[i], requirementsMap));
                }
            }
        }

        if (data.hasOwnProperty('name')) {
            this.name = data.name;
        } else {
            this.name = "Short but meaningful/readable description";
        }
    }

    function RequirementsGroup(data, requirementsMap) {
        if (data.hasOwnProperty('weightNeg')) {
            this.weightNeg = data.weightNeg;
        } else {
            this.weightNeg = 1.0;
        }
        if (data.hasOwnProperty('description')) {
            this.description = data.description;
        } else {
            this.description = "Full-length, detailed description";
        }
        if (data.hasOwnProperty('weightPos')) {
            this.weightPos = data.weightPos;
        } else {
            this.weightPos = 1.0;
        }
        if (data.hasOwnProperty('Priority')) {
            this.Priority = data.Priority;
        } else {
            this.Priority = 1;
        }

        this.children = [];
        if (data.hasOwnProperty('children')) {
            for (var i=0; i<data.children.length; i++) {
                if (data.children[i].hasOwnProperty('KPP')) {
                    var newRequirementObject = new Requirement(data.children[i]);
                    requirementsMap[newRequirementObject.name] = newRequirementObject;
                    this.children.push(newRequirementObject);
                } else {
                    this.children.push(new RequirementsGroup(data.children[i], requirementsMap));
                }
            }
        }

        if (data.hasOwnProperty('name')) {
            this.name = data.name;
        } else {
            this.name = "Short but meaningful/readable description";
        }
    }

    function Requirement(data) {
        if (data.hasOwnProperty('KPP')) {
            this.KPP = data.KPP;
        } else {
            this.KPP = true;
        }
        if (data.hasOwnProperty('function')) {
            this.function = data.function;
        } else {
            this.function = "";
        }
        if (data.hasOwnProperty('weightNeg')) {
            this.weightNeg = data.weightNeg;
        } else {
            this.weightNeg = 1.0;
        }
        if (data.hasOwnProperty('weightPos')) {
            this.weightPos = data.weightPos;
        } else {
            this.weightPos = 1.0;
        }
        if (data.hasOwnProperty('description')) {
            this.description = data.description;
        } else {
            this.description = "Full-length, detailed description";
        }
        if (data.hasOwnProperty('name')) {
            this.name = data.name;
        } else {
            this.name = "Short but meaningful/readable description";
        }
        if (data.hasOwnProperty('Priority')) {
            this.Priority = data.Priority;
        } else {
            this.Priority = 1;
        }
        if (data.hasOwnProperty('objective')) {
            this.objective = data.objective;
        } else {
            this.objective = "";
        }
        if (data.hasOwnProperty('threshold')) {
            this.threshold = data.threshold;
        } else {
            this.threshold = "";
        }
        if (data.hasOwnProperty('testBench')) {
            this.testBench = data.testBench;
        } else {
            this.testBench = "";
        }
        if (data.hasOwnProperty('unit')) {
            this.unit = data.unit;
        } else {
            this.unit = "";
        }
        if (data.hasOwnProperty('metricName')) {
            this.metricName = data.metricName;
        } else {
            this.metricName = "";
        }
    }

    function Metric (requirementInstance) {
        this.Description = requirementInstance.description;
        this.DisplayedName = null;
        this.GMEID = null;
        this.Value = null;
//        this.objective = null;
//        this.threshold = null;
//        this.shouldPass = null;
//        this.average = null;
//        this.difference = null;
        this.ID = null;
        this.Unit = requirementInstance.unit;
        this.Name = requirementInstance.metricName;
    }

    function TestbenchManifest (name, designName) {
        this.Status = "OK";
        this.Parameters = [];
        this.Created = "";
        this.Artifacts = [];
        this.TierLevel = 0;
        this.DesignName = designName;
        this.LimitChecks = [];
        this.Metrics = [];
        this.DesignID = "";
        this.Steps = [];
        this.TestBench = name;
        this.PCCResults = {};
    }
};

if (require.main === module) {
    main();
}