/**
 * Created by Dana Zhang on 10/6/2014.
 */

// Metrics Questions/assumptions
// Priority
// threshold and objective can be undefined
// what's weightNeg and weightPos
// category = true ?
// testbench is the name of the testbench from which value will be computed
// unit conversion?
// functions are all linear?  do they have a fixed format? score = A x (threshold - value)/(objective - threshold) + B perhaps?

var CHILDREN = "children";
var NAME = "name";

// used as key
var METRIC_NAME = "metricName";
var TESTBENCH = "testBench";
var DELIM = "+";
// used as key

// rqmt associated constants
var THRESH = "threshold";
var OBJECTIVE = "objective";
var FUNCTION = "function";
var UNIT = "unit";
var KPP = "KPP";
var WEIGHT_POS = "weightPos";
var PRIORITY = "Priority";

// design associated constants
var DESIGN_TB = "TestBench";
var METRICS = "Metrics";
var VALUE = "Value";
var METRIC_UNIT = "Unit";

// round to 1/ROUND decimal places
var ROUND = 1000;

var metricsTable = {};

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

    processDesigns(designFileNames);
    processRqmtFile(rqmtFileName);
};

/**
 * store all requirements along with the original hierarchy in a dictionary
 * key is unique name of metric
 * value is information needed to calculate the score for each metric along with parentNode
 * @param filename - name of requirement file
 */
var processRqmtFile = function (filename) {
    var root = require('./' + filename),
        result,
        outFileName = path.resolve(__dirname, 'result_' + filename);

    root = processRqmt(root);
    result = generateOutput(root);
    fs.writeFileSync(outFileName, JSON.stringify(result) , 'utf-8');
};

var processRqmt = function (node) {
    var children,
        child,
        i,
        subNode,
        subScore;

    if (node.hasOwnProperty(CHILDREN)) {
        // if node is not leaf
        children = node[CHILDREN];
        for (i = 0; i < children.length; i += 1) {
            child = children[i];
            // keep going until we reach leaf
            if (!node.score) {
                node.score = 0;
            }

            subNode = processRqmt(child);
            subScore = subNode.hasOwnProperty("result") ? subNode.result.score : subNode.score;
            if (subScore === 0) {
                node.pass = false;
            }
            node.score = node.pass === false ? 0 : node.score + subScore;
        }
    } else {
        // if node is leaf - a requirement, evaluate it
        node.result = evaluateRqmt(node);
    }
    return node;
};

var evaluateRqmt = function (rqmtNode) {
    var key = rqmtNode[TESTBENCH] + DELIM + rqmtNode[METRIC_NAME],
        metricNode = metricsTable[key],
        result = {
            score: 0,
            type: ""
        };

    if (metricNode) {
        // if requirement has a matching metric in the design file
        result = evaluate(rqmtNode, metricNode);

    } else {
        result.type = "no data";
    }

    return result;
};

var generateOutput = function (node) {
    var children,
        i,
        child,
        result = {};

    if (node.hasOwnProperty(CHILDREN)) {

        result.name = node[NAME];
        result.Priority = node[PRIORITY];
        result.pass = node.pass !== false;
        result.score = Math.round(node.score * ROUND) / ROUND;

        children = node[CHILDREN];
        result.children = [];
        for (i = 0; i < children.length; i += 1) {
            child = children[i];
            result.children.push(generateOutput(child));
        }
    } else {
        result = {
            name: node[METRIC_NAME],
            Priority: node[PRIORITY],
            pass: node.result.score !== 0,
            score: Math.round(node.result.score * ROUND) / ROUND,
            type: node.result.type
        }
    }
    return result;
};

/**
 *
 * @param filenames - list of design files
 */
var processDesigns = function (filenames) {
    var i,
        design;

    for (i = 0; i < filenames.length; i += 1) {
        design = require('./' + filenames[i]);
        getMetricsFromDesign(design);
    }
    console.log();
};

var getMetricsFromDesign = function (design) {
    var testbench = design[DESIGN_TB],
        metrics = design[METRICS],
        i,
        metric,
        key,
        metricValue;

    for (i = 0; i < metrics.length; i += 1) {
        metric = metrics[i];
        key = testbench + DELIM + metric["Name"];
        metricValue = {
            Value: metric[VALUE],
            unit: metric[METRIC_UNIT],
            KPP: metric[KPP]
        };
        metricsTable[key] = metricValue;
    }
};

/**
 * Strictly linear function, assuming score is 0.1 at Threshold
 * @param reqNode
 * @param metricNode
 */
var evaluate = function (reqNode, metricNode) {
    var weight = reqNode[WEIGHT_POS],
        T = reqNode[THRESH],
        O = reqNode[OBJECTIVE],
        A = 0.9 / (O - T), // todo: handle the divideZero case
        B = 1 - A * O,
        factor = convertUnit(metricNode[UNIT], reqNode[UNIT]), // todo: apply unit conversion if necessary
        adjusted_metric = metricNode[VALUE] === null ? null : metricNode[VALUE] * factor,
        score,
        type,
        resultNode,
        _score; // fn

    _score = function (val) {
        if (val === null) {
            score = 0;
            type = "no data";
        } else if (T <= O && val < T || T > O && val > T) {
            score = 0;
            type = "does not meet threshold";
        } else if (T <= O && val >= O || T > O && val <= O) {
            score = 1;
            type = "meet objective";
        } else {
            score = (val * A + B); // weighted score
            type = "above threshold";
        }
    };

    if (reqNode[KPP] && metricNode[KPP] === false) {
        score = 0;
        type = "violated kpp";
    } else {
        _score(adjusted_metric);
        // applyFunction(requirement[FUNCTION], metricVal); // todo: apply function to metricVal and output to score
    }

    resultNode = {
        score: Math.round(score * weight * ROUND) / ROUND,
        type: type
    };
    return resultNode;
};


/**
 * Evaluate design metric value against requirements
 * @param metricValue
 * @param func
 */
var applyFunction = function (func, metricValue) {
    // todo: when function is defined, evaluate it
};

/**
 *
 * @param unit
 * @returns a factor of design metricValue
 * @param target
 */
var convertUnit = function (unit, target) {
    var factor = 1;
    if (unit.toLowerCase() === target.toLowerCase()) {
        factor = 1;
    } else {
        // todo: change factor to unit conversion result
    }
    return factor;
};

var fs = require('fs');
var path = require('path');
score();
