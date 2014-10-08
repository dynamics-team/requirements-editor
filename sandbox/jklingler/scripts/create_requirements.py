import os
import requirements_creation as req
import csv
import json
from optparse import OptionParser


def make_requirements_json(csv_path):

    abs_path = os.path.abspath(csv_path)
    f_name = os.path.splitext(os.path.basename(abs_path))[0]

    with open(csv_path, 'r') as f_in:
        csv_reader = csv.reader(f_in)

        top_level_group = req.TopLevelRequirementsGroup(f_name)
        test_bench_groups = {}

        i = 0
        for row in csv_reader:

            if len(row) < 7:
                print "csv contains less than the optimal information"

            if i != 0:

                args = tuple(row[0:7])
                new_requirement = req.Requirement(*args)

                # Check if there is a group for this testbench
                test_bench_name = row[5]
                if test_bench_name not in test_bench_groups:
                    test_bench_groups[test_bench_name] = req.RequirementsGroup(test_bench_name)

                # Add the requirement to the appropriate group
                test_bench_groups[test_bench_name].children[new_requirement.name] = new_requirement

            i += 1

        top_level_group.children = test_bench_groups

        jsonString = top_level_group.json()

        with open(f_name + '.json', 'w') as f_out:
            json.dump(jsonString, f_out)

if __name__ == "__main__":

    parser = OptionParser()
    parser.add_option("--CSVPATH",
                      help='Table of requirements in csv format: '
                           'name, unit,  description, threshold, objective, test_bench, metric_name, group_name')

    (opts, args) = parser.parse_args()

    if opts.CSVPATH:
        make_requirements_json(opts.CSVPATH)