import requirements_creation as req
import csv
import json


def do_it_all():

    with open("generate_requirements.csv", 'r') as f_in:
        csv_reader = csv.reader(f_in)
        
        headers = []
        requirements = []
        i = 0
        
        for row in csv_reader:
            if i==0:
                headers = row
            else:
                args = tuple(row[:-1])
                newRequirement = req.Requirement(*args)
                requirements.append(newRequirement)
                
                print "+++++++++++++++++++"
                jsonString = json.dumps(newRequirement.json)
                print jsonString

            i += 1
                
if __name__ == "__main__":
    do_it_all()