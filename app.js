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
curl -X DELETE http://127.0.0.1:8844/result/TestResult
curl -X DELETE http://127.0.0.1:8844/requirement/posted
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
    app.use(require('cookie-parser')());
    //app.use(express.bodyParser());

    var auth = require('./src/server/auth_google_oauth2');
    //var auth = require('./src/server/auth_fake');
    auth.init(app);

    var controller = require('./src/server/controller');
    controller.init(app, esClient);

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
            Requirement.find({ title: 'Radio Example'}, function (err, docs) {
                if (docs.length === 0) {
                    var instance = new Requirement();
                    instance.title = 'Radio Example';

                    instance.children = [
                        JSON.parse(fs.readFileSync('sandbox/jklingler/Examples/Radio/TopLevelRequirementGroup.json', {encoding: 'utf-8'}))
                    ];
                    instance.auth_read = [req.session.passport.user];
                    instance.auth_write = [req.session.passport.user];
                    instance.auth_admin = [req.session.passport.user];
                    instance.save(function (err) {
                        dataCreated = true;
                        next();
                    });
                } else {
                    next();
                }
            });
        });
    }
    addTestData();

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
