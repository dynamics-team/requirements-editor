__author__ = 'James Klingler - Institute for Software Integrated Systems, Vanderbilt University'

import json
import random
import uuid
import datetime

class TopLevelRequirementsGroup(object):

    def __init__(self, name):

        self.category = True
        self.weight_neg = 1.0  # Real [0,1]
        self.description = None
        self.weight_pos = 1.0  # Real [0,1]
        self.priority = 1  # any positive integer
        self.children = {}
        self.name = name

    def json(self):

        json_result = {
            "category": self.category,
            "weightNeg": self.weight_neg,
            "description": self.description,
            "weightPos": self.weight_pos,
            "Priority": self.priority,
            "children": [r_group.json() for key, r_group in self.children.iteritems()],
            "name": self.name
        }

        return json_result


class RequirementsGroup(object):

    def __init__(self, name):

        self.weight_neg = 1.0  # Real [0,1]
        self.description = None
        self.weight_pos = 1.0  # Real [0,1]
        self.priority = 1  # any positive integer
        self.children = {}
        self.name = name

    def json(self):

        json_result = {
            "weightNeg": self.weight_neg,
            "description": self.description,
            "weightPos": self.weight_pos,
            "Priority": self.priority,
            "children": [r_group.json() for key, r_group in self.children.iteritems()],
            "name": self.name
        }

        return json_result


class Requirement(object):

    def __init__(self, name=None, unit=None, description=None, threshold=None, objective=None, test_bench=None, metric_name=None):

        self.kpp = True
        self.function = ""
        self.weight_neg = 1.0  # Real [0,1]
        self.description = description
        self.weight_pos = 1.0  # Real [0,1]
        self.priority = 1  # any positive integer
        self.name = name
        self.objective = float(objective)
        self.threshold = float(threshold)
        self.test_bench = test_bench
        self.unit = unit
        self.metric_name = metric_name

    def json(self):

        json_result = {
            "KPP": self.kpp,
            "function": self.function,
            "weightNeg": self.weight_neg,
            "name": self.name,
            "weightPos": self.weight_pos,
            "description": self.description,
            "Priority": self.priority,
            "objective": self.objective,
            "testBench": self.test_bench,
            "threshold": self.threshold,
            "unit": self.unit,
            "metricName": self.metric_name
        }

        return json_result


class Metric(object):

    def __init__(self):

        gme_id_1 = ''.join(random.choice('0123456789abcdef') for i in range(4))
        gme_id_2 = ''.join(random.choice('0123456789abcdef') for i in range(8))

        id_1 = ''.join(random.choice('0123456789abcdef') for i in range(8))
        id_2 = ''.join(random.choice('0123456789abcdef') for i in range(4))
        id_3 = ''.join(random.choice('0123456789abcdef') for i in range(4))
        id_4 = ''.join(random.choice('0123456789abcdef') for i in range(4))
        id_5 = ''.join(random.choice('0123456789abcdef') for i in range(12))

        self.description = "DefaultDescription"
        self.displayed_name = None
        self.gme_id = "id-" + gme_id_1 + "-" + gme_id_2
        self.value = None
        self.id = id_1 + "-" + id_2 + "-" + id_3 + "-" + id_4 + "-" + id_5
        self.unit = None
        self.name = "DefaultDescription"

    def json(self):

        json_result = {
            "Description": self.description,
            "DisplayedName": self.displayed_name,
            "GMEID": self.gme_id,
            "Value": self.value,
            "ID": self.value,
            "Unit": self.unit,
            "Name": self.name
        }

        return json_result


class Manifest(object):

    def __init__(self):

        self.status = "OK",
        self.parameters = [],
        self.date_today = datetime.date.today(),
        self.artifacts = [],
        self.tier_level = 0,
        self.design_name = ''.join(random.choice('abcdef') for i in range(8)),
        self.limit_checks = [],
        self.metrics = [],
        self.design_id = "{" + str(hash(self.design_name)) + "}",
        self.steps = [],
        self.testbench = "TestBenchName",
        self.pcc_results = {}

    def json(self):


        json_result = {
            "Status": self.status,
            "Parameters": [],
            "Created": self.date_today,
            "Artifacts": [],
            "TierLevel": self.tier_level,
            "DesignName": self.design_name,
            "LimitChecks": self.limit_checks,
            "Metrics": [m.json() for m in self.metrics],
            "DesignID": self.design_id,
            "Steps": self.steps,
            "TestBench": self.testbench,
            "PCCResults": {}
        }
        return json_result