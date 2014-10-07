/**
 *
 * if you turn off auth, you can test like this:
 * curl -d {\"title\":\"posted\"} -H "Content-Type: application/json" http://127.0.0.1:8844/requirement/
 * curl -X DELETE http://127.0.0.1:8844/requirement/posted
 */

var MONGO_CONNECTION = 'mongodb://localhost/requirements-editor'; // see http://docs.mongodb.org/manual/reference/connection-string/
var SESSION_PARAMS = {
    saveUninitialized: true,
    resave: true,
    cookie: { path: '/', httpOnly: true, secure: false, maxAge: 60 * 60 * 1000 }
};


var fs = require('fs');
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

    var mongoose = require('mongoose');
    var mongooseConnection = mongoose.connect(MONGO_CONNECTION);
    var Schema = mongoose.Schema,
        ObjectId = Schema.ObjectId;

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

    var User = mongoose.model('User', new Schema({
        id: String,
        displayName: String
    }));

    passport.use(new GoogleStrategy({
            returnURL: 'http://localhost:8844/auth/google/return',
            realm: 'http://localhost:8844/'
        },
        function (identifier, profile, done) {
            /**
             * identifier= https://www.google.com/accounts/o8/id?id=AIredacted
             profile= { displayName: 'Kevin Smyth',
           emails: [ { value: 'kevin.m.smyth@gmail.com' } ],
             name: { familyName: 'Smyth', givenName: 'Kevin' } }
             */
            User.findOneAndUpdate({ id: identifier }, { id: identifier, displayName: profile.displayName }, {upsert: true}, function (err, user) {
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
        res.send(200, JSON.stringify(req.user));
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

    var Requirement = mongoose.model('Requirement', new Schema({
        author: ObjectId,
        version: Number,
        title: String,
        children: {},
        auth_read: [String],
        auth_write: [String],
        auth_admin: [String]
    }));

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

    app.del('/requirement/:title', function (req, res) {
        if (!req.params.title) {
            res.send(400);
            return;
        }
        Requirement.find({ title: req.params.title }).remove(function (doc) {
            res.send(200);
        });
    });

    //app.use(function (req, res, next) {
    //    console.log(req);
    //    next();
    //});
    app.use(express.static(__dirname + '/public'));
    app.use(express.static(__dirname + '/src/build'));

    mongoose.connection.once('open', function (err) {
        console.log('Connected to db');
        var server = app.listen(8844, function () {
            console.log('Listening on port %d', server.address().port);
        });
    });
}
