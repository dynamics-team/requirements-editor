var model = require('./model');
var User =  model.User;

exports.init = function(app) {
    var SESSION_PARAMS = global.CONFIG.sessionParameters;

    var passport = require('passport'),
        GoogleStrategy = require('passport-google').Strategy;

    app.use('/', require('express-session')(SESSION_PARAMS));
    app.use('/', passport.initialize());
    app.use('/', passport.session());

    app.use(function (req, res, next) {
        if (req.isAuthenticated()) {
            // req.session.passport.user = req.session.passport.user || "fake";
            res.set('X-User-Id', req.session.passport.user);
            return next();
        }
        if (req.path.substr(0, 6) === '/auth/') {
            return next();
        }
        res.redirect('/auth/google');
    });

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


};