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
var TESTBENCH = "testBench";
var DELIM = "+";

var requirements = {};
var arr = [];
/**
 * score design file against requirement file
 */
var score = function () {
    var args = process.argv.slice(2),// get application arguments, i.e. file names passed in
        rqmtFileName = args[0], // get the requirement file
        designFileNames = [],
        i;

    for (i = 1; i < args.length; i += 1) {
        designFileNames.push(args[i]);
    }

    processRqmtFile(rqmtFileName);
    processDesigns(designFileNames);
    // output final json object(s) containing score(s) of the input design(s)
};

/**
 * store all requirements along with the original hierarchy in a dictionary
 * key is unique name of metric
 * value is information needed to calculate the score for each metric along with parentNode
 * @param filename - name of requirement file
 */
var processRqmtFile = function (filename) {
    var root = require('./' + filename),
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
        node,
        key; // key of a requirement pair is composed of the testbench name + metric name
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
            node.threshold = child[THRESH];
            node.objective = child[OBJECTIVE];
            node.function = child[FUNCTION];
            node.unit = child[UNIT];
            node.KPP = child[KPP];
            key = child[TESTBENCH] + DELIM + child[METRIC_NAME];
            requirements[key] = node;
        }
    }
};

var processDesigns = function (filenames) {
    var i,
        design;

    for (i = 0; i < filenames.length; i += 1) {
        design = require('./' + filenames[i]);
    }
};


score();
