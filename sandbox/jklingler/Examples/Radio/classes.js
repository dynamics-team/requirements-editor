/**
 * Created by J on 10/7/2014.
 */

'use strict';

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

module.exports.TestBenchManifest = TestbenchManifest;
module.exports.Metric = Metric;
module.exports.Requirement = Requirement;
module.exports.RequirementsGroup = RequirementsGroup;
module.exports.TopLevelRequirementsGroup = TopLevelRequirementsGroup;