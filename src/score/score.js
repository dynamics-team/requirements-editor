/**
 * Created by Dana Zhang on 10/6/2014.
 */

// Metrics factored/unfactored:
    // Priority
    // threshold and objective can be undefined
    // what's weightNeg and weightPos
    // category = true ?
    // testbench is the name of the testbench from which value will be computed

var CHILDREN = "children";
var NAME = "name";
var WEIGHT = "weight";
var METRIC_NAME = "metricName";
var THRESH = "threshold";
var OBJECTIVE = "objective";
var FUNCTION = "function";
var UNIT = "unit";
var KPP = "KPP";
var TESTBENCH = "testbench";

var requirements = {};

/**
 * score design file against requirement file
 * @param rqmt - json object containing requirements
 * @param design - json object containing a design file
 */
var score = function () {
    processRqmtFile();

    // output final json object(s) containing score(s) of the input design(s)

};

/**
 * store all requirements along with the original hierarchy in a dictionary
 * key is unique name of metric
 * value is information needed to calculate the score for each metric along with parentNode
 */
var processRqmtFile = function () {
    var args = process.argv.slice(2),// get application arguments, i.e. file names passed in
        rqmtFileName = args[0], // get the requirement file
    // todo: get design file names here
        root = require('./' + rqmtFileName),
        node = {
            name: root[NAME],
            parent: null
        };

    if (root.hasOwnProperty(CHILDREN)) {
        processChildren(root[CHILDREN], node);
    }
};

var processChildren = function (children, parent) {
    var i,
        child,
        node;
    children.sort(function(a, b){
        return a[NAME] > b[NAME];
    });
    for (i = 0; i < children.length; i += 1) {
        child = children[i];
        node = {
            name: child[NAME],
            weight: child[WEIGHT],
            parent: parent
        };
        if (child.hasOwnProperty(CHILDREN)) {
            processChildren(child[CHILDREN], node);
        } else {
            node.testbench = child[TESTBENCH];
            node.threshold = child[THRESH];
            node.objective = child[OBJECTIVE];
            node.function = child[FUNCTION];
            node.unit = child[UNIT];
            node.KPP = child[KPP];
            requirements[child[METRIC_NAME]] = node;
        }
    }
};


score();
