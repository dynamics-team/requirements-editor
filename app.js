var mongoose = require('mongoose');
var mongooseConnection = mongoose.connect('mongodb://localhost/requirements-editor');

var express = require('express');
var app = express();


var Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

var Requirement = mongoose.model('Requirement',  new Schema({
    author: ObjectId,
    version: Number,
    title: String,
    children: {}
}));

app.get('/requirement', function (req, res) {
    Requirement.find({}, function (err, docs) {
        res.json(docs);
    });
});

app.get('/requirement/:title', function (req, res) {
    if (!req.params.title) {
        res.send(400);
        return;
    }
    Requirement.find({ title: req.params.title}, function (err, docs) {
        res.json(docs);
    });
});

app.post('/requirement/', function (req, res) {
    var bodyStr = '';
    req.setEncoding('utf8');
    req.on("data", function(chunk) {
        bodyStr += chunk.toString();
    });
    req.on("end",function() {
        try {
            var requirement = JSON.parse(bodyStr);
        } catch (e) {
        }
        if (!requirement || !requirement.title) {
            res.send(400);
            return;
        }
        Requirement.findOneAndUpdate({title: requirement.title}, requirement, {upsert:true}, function(err, doc){
           if (err)
                return res.send(500, { error: err });
           return res.json(doc);
        });
    });
});

// test data
Requirement.find({ title: 'hello'}, function (err, docs) {
    if (docs.length === 0) {
        var instance = new Requirement();
        instance.title = 'hello';
        instance.children = [
            {
                "name": "Movement",
                "weightNeg": 1,
                "description": "Performance of the Vehicle Movement",
                "weightPos": 1,
                "Priority": 1,
                "children": [
                    {
                        "weightNeg": 1,
                        "name": "Speed",
                        "description": "Speed and Accelerations",
                        "weightPos": 1,
                        "Priority": 1,
                        "children": [ ]
                    }
                ]
            }
        ];
        instance.save(function (err) {
        });
    }
});

app.use(express.static(__dirname + '/public'));

mongoose.connection.on('open', function(err) {
    console.log('Connected to db');
    var server = app.listen(8844, function() {
        console.log('Listening on port %d', server.address().port);
    });
});

