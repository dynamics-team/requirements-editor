var model = require('./model');
var express = require('express');

exports.init = function(app, esClient) {
    var User =  model.User;
    // var UserSchema = model.UserSchema;
    var Requirement = model.Requirement;
    var RequirementSchema = model.RequirementSchema;

    app.get('/user', function (req, res) {
        User.find({}, { type: 0 })
            .select('-_id')
            .select('-__v')
            .exec(function (err, docs) {
                res.json(docs);
            });
    });

    function cleanRequirement(doc) {
        delete doc._id;
        delete doc.__v;
        return doc;
    }

    app.get('/requirement/', function (req, res) {
        Requirement.find({auth_read: req.session.passport.user})
            .select('-children')
            .exec(function (err, docs) {
                res.json(docs.map(function (v) { return cleanRequirement(v.toObject()); }));
            });
    });

    app.get('/requirement/:title', function (req, res) {
        if (!req.params.title) {
            res.send(400);
            return;
        }
        Requirement.find({ title: req.params.title, auth_read: req.session.passport.user}, function (err, docs) {
            if (docs.length === 0) {
                res.send(404);
                return;
            }
            res.json(cleanRequirement(docs[0].toObject()));
        });
    });

    function getReqJSON(req, callback) {
        var bodyStr = '';
        req.setEncoding('utf8');
        req.on("data", function (chunk) {
            bodyStr += chunk.toString();
        });
        req.on("end", function () {
            try {
                var json = JSON.parse(bodyStr);
            } catch (e) {
            }
            callback(json);
        });
    };

    app.post('/requirement/', function (req, res) {
        getReqJSON(req, function(requirement) {
            if (!requirement || !requirement.title) {
                res.send(400);
                return;
            }
            Requirement.findOne({title: requirement.title}, function (err, doc) {
                if (err || doc)
                    return res.send(409);
                requirement = new Requirement(requirement);
                requirement.auth_read = [req.session.passport.user];
                requirement.auth_write = [req.session.passport.user];
                requirement.auth_admin = [req.session.passport.user];
                requirement.save(function (err) {
                    if (err)
                        return res.status(500).send({ error: err });
                    res.status(200).send('created');
                });
            });
        });
    });

    app.put('/requirement/:title', function (req, res) {
        if (!req.params.title) {
            res.send(400);
            return;
        }
        getReqJSON(req, function(requirement) {
            if (!requirement) {
                res.send(400);
                return;
            }
            delete requirement.title; // we don't allow the title to be changed
            Requirement.findOne({title: req.params.title, auth_write: req.session.passport.user}, function (err, doc) {
                if (err)
                    return res.status(500).end();
                if (doc === null)
                    return res.status(404).end();
                RequirementSchema.eachPath(function (key) {
                    if (key in requirement) {
                        doc[key] = requirement[key];
                    }
                });
                doc.save(function (err) {
                    if (err)
                        return res.status(500).send({ error: err });
                    var auth = {auth_read: doc.auth_read, auth_write: doc.auth_write, auth_admin: doc.auth_admin};
                    model.Result.update({requirement: doc.title}, auth, function (err, doc) {
                        if (err)
                            return res.status(500).send(err);
                        res.status(200).send('updated');
                    });
                });
            });
        });
    });

    app['delete']('/requirement/:title', function (req, res) {
        if (!req.params.title) {
            res.send(400);
            return;
        }
        Requirement.findOneAndRemove({ title: req.params.title, auth_admin: req.session.passport.user }, {}, function(err, doc) {
            if (err)
                return res.send(500);
            model.Result.remove({ requirement: req.params.title }, function(err, docResult) {
                if (err)
                    return res.send(500);
                if (doc) {
                    res.send(200);
                } else {
                    res.send(404);
                }
            });
        });
    });


    app.get('/result/', function (req, res) {
        model.Result.find({auth_read: req.session.passport.user})
            .select('-testbench_manifests')
            .exec(function (err, docs) {
                res.json(docs.map(function (v) { return cleanRequirement(v.toObject()); }));
            });
    });

    app.get('/result/:name', function (req, res) {
        if (!req.params.name) {
            res.send(400);
            return;
        }
        model.Result.find({ name: req.params.name, auth_read: req.session.passport.user}, function (err, docs) {
            if (docs.length === 0) {
                res.send(404);
                return;
            }
            res.json(cleanRequirement(docs[0].toObject()));
        });
    });

    app.post('/result/', function (req, res) {
        getReqJSON(req, function(result) {
            if (!result || !result.requirement || !result.name) {
                res.send(400);
                return;
            }
            Requirement.findOne({title: result.requirement}, function (err, requirement) {
                if (err)
                    return res.send(500);
                if (!requirement)
                    return res.status(404).send('Cannot find requirement');
                model.Result.findOne({name: result.name}, function (err, doc) {
                    if (err)
                        return res.send(500);
                    if (doc)
                        return res.status(409).send('Already exists');
                    result = new model.Result(result);
                    result.auth_read = requirement.auth_read;
                    result.auth_write = requirement.auth_write;
                    result.auth_admin = requirement.auth_admin;
                    result.save(function (err) {
                        if (err)
                            return res.status(500).send({ error: err });
                        res.status(200).send('created');
                    });
                });
            });
        });
    });

    app.put('/result/:name', function (req, res) {
        if (!req.params.name) {
            res.send(400);
            return;
        }
        getReqJSON(req, function(result) {
            if (!result) {
                res.send(400);
                return;
            }
            ['name', 'auth_read', 'auth_write', 'auth_admin'].forEach(function(key) {
                delete result[key]; // we don't allow these to be changed
            });
            model.Result.findOne({name: req.params.name, auth_write: req.session.passport.user}, function (err, doc) {
                if (err)
                    return res.status(500).end();
                if (doc === null)
                    return res.status(404).end();
                model.ResultSchema.eachPath(function (key) {
                    if (key in result) {
                        doc[key] = result[key];
                    }
                });
                doc.save(function (err) {
                    if (err)
                        return res.status(500).send({ error: err });
                    res.status(200).send('updated');
                });
            });
        });
    });

    app['delete']('/result/:name', function (req, res) {
        if (!req.params.name) {
            res.send(400);
            return;
        }
        model.Result.findOneAndRemove({ name: req.params.name, auth_admin: req.session.passport.user }, {}, function(err, doc) {
            if (err)
                return res.send(500);
            if (doc) {
                res.send(200);
            } else {
                res.send(404);
            }
        });
    });

    var generateResults = require('../../sandbox/jklingler/generateResults');
    app.post('/generate_results/:requirement', function (req, res) {
        if (!req.params.requirement) {
            console.log('here');
            return res.send(400);
        }
        model.Requirement.findOne({title: req.params.requirement, auth_read: req.session.passport.user}, function (err, doc) {
            if (err)
                return res.send(500);
            var num = req.query.n || 1;
            var results = generateResults.generateResults(doc, num);
            for (var i = 0; i < results.length; i += 1) {
                var result = new model.Result();
                result.requirement = req.query.requirement;
                result.auth_read = doc.auth_read;
                result.auth_write = doc.auth_write;
                result.auth_admin = doc.auth_admin;
                result.testbench_manifests = results[i];
                result.save(function (err) {
                    if (err)
                        console.log(err);
                        //return res.status(500).send({ error: err });
                    //res.status(200).send('created');
                });
            }
            // TODO: fix me we need to wait for all async calls and then return?
            res.send(200);
        });
    });

    var score = require('../score/score');
    app.get('/score/', function (req, res) {
        if (!req.query.requirement || !req.query.result)
            return res.send(400);
        model.Result.findOne({name: req.query.result, requirement: req.query.requirement, auth_read: req.session.passport.user}, function (err, result) {
            if (err)
                return res.send(500);
            if (!result)
                return res.send(404);
            model.Requirement.findOne({title: req.query.requirement, auth_read: req.session.passport.user}, function (err, requirement) {
                if (err)
                    return res.send(500);
                if (!requirement)
                    return res.send(404);
                score(requirement, result.testbench_manifests);
            });
        });
    });

    // ELASTIC SEARCH API
    // http://localhost:9200/_stats/
    // http://localhost:9200/requirements-editor/requirement/_search
    // http://localhost:9200/requirements-editor/user/_search

    // http://localhost:9200/requirements-editor/user/_search?q=Zsolt
    // http://localhost:9200/requirements-editor/requirement/_search?q=WalkieTalkieMass

    // This server's API
    // http://localhost:8844/search/?q=WalkieTalkieMass&per_page=1&page=1
    app.get('/search', function (req, res) {
        var pageNum = req.param('page', 1),
            perPage = req.param('per_page', 15),
            userQuery = req.param('q'),
            userId = req.session.userId;

        esClient.search({
            index: 'requirements-editor',
            from: (pageNum - 1) * perPage,
            size: perPage,
            q: userQuery
        }, function (error, response) {
            if (error) {
                // handle error
                res.send(error);
                return;
            }

            res.send({
                results: response.hits.hits,
                page: pageNum,
                pages: Math.ceil(response.hits.total / perPage)
            })
        });
    });

    app.get('/', function (req, res) {
        var ua = req.headers['user-agent'].toLowerCase();
        if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(ua)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(ua.substr(0,4))) {
            res.writeHead(307, {Location: CONFIG.publicUrl + '/mobile'});
            res.end();
            return;
        }
        res.writeHead(307, {Location: CONFIG.publicUrl + '/app'});
        res.end();
        return;
    });
    //app.use(function (req, res, next) {
    //    console.log(req);
    //    next();
    //});
    app.use(express.static(__dirname + '/../../public'));
    app.use(express.static(__dirname + '/../../src/build'));

};
