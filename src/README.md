# Interfaces #
## Scoring and Results ##
### Scoring ###

/**
 * Scores a design against a requirement.
 * @param {object} requirement - Requirement to score against.
 * @param {[object]} results - Array of test-bench results for one design.
 * @returns {object} - Result objects (with same structure as requirement but with scores).
 */

var score = function(requirement, results) { return result; }`

see `\src\score\MyDesign_1_result.json` for example of result object.

### Result generator ###
/**
 * Generates n result sets for a requirement (each set is for one design).
 * @param {object} requirement - Requirement to generate results for.
 * @param {number} n - Number of designs to generate results for.
 * @returns {[[object]} - Array of arrays of objects. Where each object is a test-bench result.
 */

var generateResults = function(requirement, n) {
    // Example with requirement with m number of metrics
    return [ [tb_11, ..., tb_1m], ... , [tb_n1, ..., tb_nm] ];
}


//TODO: How to link to CAD in test-bench manifest? 

