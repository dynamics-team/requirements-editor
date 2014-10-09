/**
 *
 * if you user auth_fake, you can test like this:
curl -d {\"title\":\"posted\"} -H "Content-Type: application/json" http://127.0.0.1:8844/requirement/
curl -X PUT -d {\"children\":123} -H "Content-Type: application/json" http://127.0.0.1:8844/requirement/posted
curl -d {\"name\":\"TestResult\",\"requirement\":\"posted\"} http://127.0.0.1:8844/result/
curl -X PUT -d {\"testbench_manifests\":[{\"m1\":1}]} http://127.0.0.1:8844/result/TestResult
curl http://127.0.0.1:8844/result/TestResult
curl -X PUT -d {\"auth_admin\":[\"fake\",\"fake2\"]} -H "Content-Type: application/json" http://127.0.0.1:8844/requirement/posted
curl http://127.0.0.1:8844/requirement/posted
curl http://127.0.0.1:8844/result/TestResult
curl http://127.0.0.1:8844/score/?requirement=posted^&result=TestResult
curl -X DELETE http://127.0.0.1:8844/result/TestResult
curl -X DELETE http://127.0.0.1:8844/requirement/posted

curl -d @sandbox/test_requirements.json -H "Content-Type: application/json" http://127.0.0.1:8844/requirement/
curl http://127.0.0.1:8844/requirement/Test1
curl -X POST http://127.0.0.1:8844/generate_results/Test1?n=10
curl http://127.0.0.1:8844/result/Result_1412864086_0
curl http://127.0.0.1:8844/score/?requirement=Test1^&result=Result_1412864086_0
 */

var configFilename = 'config_localhost.json';
if (process.argv.length > 2) {
    configFilename = process.argv[2];
}
console.log('Using config file ' + configFilename);
var fs = require('fs');
var CONFIG = JSON.parse(fs.readFileSync(configFilename, {encoding: 'utf-8'}));
global.CONFIG = CONFIG;

var MONGO_CONNECTION = CONFIG.mongoConnection; // see http://docs.mongodb.org/manual/reference/connection-string/

var salts;
try {
    salts = JSON.parse(fs.readFileSync('salts.json', {encoding: 'utf-8'}));
    start();
} catch (e) {
    if (e.errno && e.errno === 34 /* ENOENT */) {
        require('crypto').randomBytes(48, function(ex, buf) {
            salts = {session_secret: buf.toString('hex')};
            fs.writeFileSync('salts.json', JSON.stringify(salts), {enconding: 'utf-8'});
            start();
        });
    } else {
        throw e;
    }
}

function start() {
    CONFIG.sessionParameters.secret = salts.session_secret;

    var mongoose = require('mongoose');
    mongoose.connect(MONGO_CONNECTION);

    var elasticsearch = require('elasticsearch');
    var esClient = new elasticsearch.Client({
        host: 'localhost:9200',
        log: {
            type: 'file',
            level: 'trace',
            path: 'elasticsearch.log'
        }
    });

    var express = require('express');
    var app = express();
    var compression = require('compression');
    app.use(require('cookie-parser')());
    app.use(compression({threshold: 512 }));
    //app.use(express.bodyParser());

    var auth = require('./src/server/auth_google_oauth2');
    //var auth = require('./src/server/auth_fake');
    auth.init(app);

    function addTestData() {
        var model = require('./src/server/model');
        var Requirement = model.Requirement;
        var dataCreated = false;
        app.use(function (req, res, next) {
            if (dataCreated) {
                return next();
            }
            if (!req.session.passport.user) {
                next();
                return;
            }
            // test data
            var numberTestDataToCreate = 100;
            var testDataCounter = numberTestDataToCreate;


            var createTestDataCounterCallback = function () {
                testDataCounter -= 1;

                if (testDataCounter === 0) {
                    next();
                }
            };

            var addRequirement = function (name, filename) {
                Requirement.find({ title: name}, function (err, docs) {
                    if (docs.length === 0) {
                        //console.log('test data (' + i.toString() + ') was added: ' + extension);
                        var instance = new Requirement();
                        instance.title = name;

                        instance.children = [
                            JSON.parse(fs.readFileSync(filename, {encoding: 'utf-8'}))
                        ];
                        instance.auth_read = [req.session.passport.user];
                        instance.auth_write = [req.session.passport.user];
                        instance.auth_admin = [req.session.passport.user];
                        instance.save(function (err) {
                            dataCreated = true;
                            createTestDataCounterCallback();
                        });
                    } else {
                        createTestDataCounterCallback();
                    }
                });
            };

            var sampleRequirements = {
                'Radio Example': 'sandbox/jklingler/Examples/Radio/TopLevelRequirementGroup.json',
                'Container Example': 'sandbox/jklingler/Examples/Container/ContainerDesign.json',
                'CarShopping Example': 'sandbox/jklingler/Examples/CarBuyer/CarBuyer.json'

                // TODO: add other requirement name and file pairs here
            };

            for (var i = 0; i < numberTestDataToCreate; i += 1) {
                var ext = (Math.floor(Math.random()*1000)).toString();

                var exampleTitles = Object.keys(sampleRequirements);
                var randomIndex = Math.floor(Math.random()*exampleTitles.length);

                var title = exampleTitles[randomIndex];
                var fname = sampleRequirements[title];

                //title = 'Radio Example';
                //fname = 'sandbox/jklingler/Examples/Radio/TopLevelRequirementGroup.json';

                addRequirement(title + ' ' + ext, fname);
            }
        });
    }
    addTestData();

    var controller = require('./src/server/controller');
    controller.init(app, esClient);



    mongoose.connection.once('open', function (err) {
        console.log('Connected to db');
        var server = app.listen(CONFIG.listenPort, function () {
            console.log('Listening on port %d', server.address().port);
        });
    });

    // Test elastic search availability
    esClient.ping({
        // ping usually has a 100ms timeout
        requestTimeout: 1000,

        // undocumented params are appended to the query string
        hello: "elasticsearch!"
    }, function (error) {
        if (error) {
            console.trace('elasticsearch cluster is down!');
        } else {
            console.log('elasticsearch: All is well');
        }
    });
}
