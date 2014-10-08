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
        req.user = new User({ id: "fake", displayName: "Fake User" }).toObject();
        req.session.passport = {user: "fake"};

        res.set('X-User-Id', req.session.passport.user);
        return next();
    });

    app.get('/auth/', function (req, res) {
        res.status(200).send(JSON.stringify(req.user));
    });
};