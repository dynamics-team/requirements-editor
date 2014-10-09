/**
 * Created by zhangpn on 10/8/2014.
 */

var score = require('./score.js');
var fs = require('fs');
var path = require('path');


/**
 * Example usage of the score function
 */
var runScore = function () {
    var args = process.argv.slice(2),// get application arguments, i.e. file names passed in
        requirementObj = require('./' + args[0]), // get the requirement file
        i,
        design,
        designName,
        designObjects = [],
        output,
        outFileName;

    for (i = 1; i < args.length; i += 1) {
        design = require('./' + args[i]);
        if (!designName) {
            designName = design.DesignName;
        }
        designObjects.push(design); // get an array of testbench result objects
    }

    output = new score(requirementObj, designObjects);
    outFileName = path.join(__dirname, designName + '_result.json');
    fs.writeFileSync(outFileName, JSON.stringify(output, null, 4) , 'utf-8');
};


if (require.main === module) {
    runScore();
}