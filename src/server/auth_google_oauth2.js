// based on http://iao.fi/myposts/passport_google_openid_migration

var model = require('./model');
var User =  model.User;

var GOOGLE_CLIENT_ID = '1079203211547-mb3cu62cu4dargeco8act54dk1prklt2.apps.googleusercontent.com';
var GOOGLE_CLIENT_SECRET = 'AqXrOQTQvF8KchvBeKNULe2u';

exports.init = function(app) {
    var SESSION_PARAMS = global.CONFIG.sessionParameters;

    var passport = require('passport'),
        GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

    app.use('/', require('express-session')(SESSION_PARAMS));
    app.use('/', passport.initialize());
    app.use('/', passport.session());

    app.use(function (req, res, next) {
        if (req.isAuthenticated()) {
            res.set('X-User-Id', req.session.passport.user);
            return next();
        }
        if (req.path.substr(0, 6) === '/auth/') {
            return next();
        }
        req.session.authRedirect = req.path;
        res.redirect('/auth/google');
    });

    var googleStrategyConfig = {
        callbackURL: CONFIG.publicUrl + '/auth/google/callback'
    };

    if (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET) {
        googleStrategyConfig.clientID = GOOGLE_CLIENT_ID;
        googleStrategyConfig.clientSecret = GOOGLE_CLIENT_SECRET;
    } else {
        throw new Error('GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET have to be defined');
    }

    var google = new GoogleStrategy(googleStrategyConfig,
        function (accessToken, refreshToken, params, profile, done) {
            var user = new User({ id: profile.id, displayName: profile.displayName }).toObject();
            var oldId = user._id;
            delete user._id;
            User.findOneAndUpdate({ id: profile.id }, user, {upsert: true}, function (err, user) {
                if (user._id !== oldId) {
                    // index it
                    user.index(function (err, res) {

                    });
                }
                done(err, user);
            });
        }
    );

    // Monkey patch to support openid.real option
    var originalAuthorizationParams = google.authorizationParams;

    google.authorizationParams = function() {
        var val = originalAuthorizationParams.apply(this, arguments);
        val['openid.realm'] = CONFIG.publicUrl;
        return val;
    };
    passport.use(google);

    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function (id, done) {
        User.findOne({ id: id}, function (err, user) {
            if (!user)
                return done("Could not find user", null);
            user = user.toObject();
            delete user._id;
            delete user.__v;
            done(err, user);
        });
    });

    app.get('/auth/google', passport.authenticate('google', { scope: ['https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email'] }));

    app.get('/auth/google/callback',
        passport.authenticate('google', { successRedirect: '/auth/success', failureRedirect: '/auth/login' }));

    app.get('/auth/success', function (req, res) {
        res.redirect(req.session.authRedirect || '/');
    });

    // app.get('/auth/login', TODO user didnt authorize us

    app.get('/auth/', function (req, res) {
        res.status(200).send(JSON.stringify(req.user));
    });


};