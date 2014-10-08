/**
 *
 * if you turn off auth, you can test like this:
 * curl -d {\"title\":\"posted\"} -H "Content-Type: application/json" http://127.0.0.1:8844/requirement/
 * curl -X DELETE http://127.0.0.1:8844/requirement/posted
 */

var configFilename = 'config_localhost.json';
if (process.argv.length > 2) {
    configFilename = process.argv[2];
}
console.log('Using config file ' + configFilename);
var fs = require('fs');
var CONFIG = JSON.parse(fs.readFileSync(configFilename, {encoding: 'utf-8'}));

var MONGO_CONNECTION = CONFIG.mongoConnection; // see http://docs.mongodb.org/manual/reference/connection-string/
var SESSION_PARAMS = CONFIG.sessionParameters;

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
    SESSION_PARAMS.secret = salts.session_secret;

    var mongoose = require('mongoose'),
        mongoosastic = require('mongoosastic');
    var mongooseConnection = mongoose.connect(MONGO_CONNECTION);
    var Schema = mongoose.Schema,
        ObjectId = Schema.ObjectId;

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

    var passport = require('passport'),
        GoogleStrategy = require('passport-google').Strategy;

    app.use('/', require('express-session')(SESSION_PARAMS));
    app.use('/', passport.initialize());
    app.use('/', passport.session());

    app.use(function (req, res, next) {
        if (req.isAuthenticated()) {
            return next();
        }
        if (req.path.substr(0, 6) === '/auth/') {
            return next();
        }
        res.redirect('/auth/google');
    });

    app.use(function (req, res, next) {
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
                instance.auth_read.push(req.session.passport.user);
                instance.save(function (err) {
                    next();
                });
            } else {
                next();
            }
        });
    });

    var UserSchema = new Schema({
            id: String,
            displayName: String
        });

    // index users
    UserSchema.plugin(mongoosastic, {index: 'requirements-editor'});

    var User = mongoose.model('User', UserSchema);

    passport.use(new GoogleStrategy({
            returnURL: CONFIG.publicUrl + '/auth/google/return',
            realm: CONFIG.publicUrl + '/'
        },
        function (identifier, profile, done) {
            /**
             * identifier= https://www.google.com/accounts/o8/id?id=AIredacted
             profile= { displayName: 'Kevin Smyth',
           emails: [ { value: 'kevin.m.smyth@gmail.com' } ],
             name: { familyName: 'Smyth', givenName: 'Kevin' } }
             */
            var user = new User({ id: identifier, displayName: profile.displayName }).toObject();
            var oldId = user._id;
            delete user._id;
            User.findOneAndUpdate({ id: identifier }, user, {upsert: true}, function (err, user) {
                if (user._id !== oldId) {
                    // index it
                    user.index(function (err, res) {

                    });
                }
                done(err, user);
            });
        }
    ));

    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function (id, done) {
        User.findOne({ id: id}, function (err, user) {
            done(err, user);
        });
    });

    app.get('/auth/google', passport.authenticate('google'));

    app.get('/auth/google/return',
        passport.authenticate('google', { successRedirect: '/', failureRedirect: '/auth/login' }));

    // app.get('/auth/login', TODO user didnt authorize us

    app.get('/auth/', function (req, res) {
        res.status(200).send(JSON.stringify(req.user));
    });

    app.get('/user', function (req, res) {
        User.find({}, { type: 0 })
            .select('-id')
            .select('-_id')
            .select('-__v')
            .exec(function (err, docs) {
                res.json(docs);
            });
    });

    var RequirementSchema = new Schema({
            author: ObjectId,
            version: Number,
            title: String,
            children: {},
            auth_read: [String],
            auth_write: [String],
            auth_admin: [String]
        });

    // index requirements
    // TODO: index nested document
    RequirementSchema.plugin(mongoosastic, {index: 'requirements-editor'});

    var Requirement = mongoose.model('Requirement', RequirementSchema);

    app.get('/requirement/', function (req, res) {
        Requirement.find({auth_read: req.session.passport.user})
            .select('-children')
            .select('-__v')
            .exec(function (err, docs) {
            res.json(docs);
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
            res.json(docs[0]);
        });
    });

    app.post('/requirement/', function (req, res) {
        var bodyStr = '';
        req.setEncoding('utf8');
        req.on("data", function (chunk) {
            bodyStr += chunk.toString();
        });
        req.on("end", function () {
            try {
                var requirement = new Requirement(JSON.parse(bodyStr));
            } catch (e) {
            }
            if (!requirement || !requirement.title) {
                res.send(400);
                return;
            }
            requirement.auth_read.push(req.session.passport.user);
            requirement.auth_write.push(req.session.passport.user);
            requirement.auth_admin.push(req.session.passport.user);
            // FIXME check if exists and no perms
            Requirement.findOneAndUpdate({title: requirement.title}, requirement, {upsert: true}, function (err, doc) {
                if (err)
                    return res.send(500, { error: err });
                return res.json(doc);
            });
        });
    });

    app['delete']('/requirement/:title', function (req, res) {
        if (!req.params.title) {
            res.send(400);
            return;
        }
        Requirement.find({ title: req.params.title, auth_admin: req.session.passport.user }).remove(function (doc) {
            res.send(200);
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
            res.end()
            return;
        }
        res.writeHead(307, {Location: CONFIG.publicUrl + '/app'});
        res.end()
        return;
    });
    //app.use(function (req, res, next) {
    //    console.log(req);
    //    next();
    //});
    app.use(express.static(__dirname + '/public'));
    app.use(express.static(__dirname + '/src/build'));

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
