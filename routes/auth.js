"use strict;"

const express = require('express');
const passport = require('passport');
const router = express.Router();
const nconf = require("nconf");
var organization = nconf.get("Organization");
var host = nconf.get("HostInfo");

router.get('/', function (req, res) {
    res.json(req.user);
});

router.get('/account', ensureAuthenticated, function (req, res) {
    res.json(req.user);
});

router.get('/login', function (req, res) {
    res.json(req.user);
});

// GET /auth/github
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  The first step in GitHub authentication will involve redirecting
//   the user to github.com.  After authorization, GitHub will redirect the user
//   back to this application at /auth/github/callback
router.get('/github',
    passport.authenticate('github', { scope: ['user:email', 'read:org'] }),
    function (req, res) {
        // The request will be redirected to GitHub for authentication, so this
        // function will not be called.
    });

// GET /auth/github/callback
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function will be called,
//   which, in this example, will redirect the user to the home page.
router.get('/github/callback',
    passport.authenticate('github', {
        successRedirect: host.SPAUrl,
        failureRedirect: '/auth/error'
    }));

router.get('/error', function (req, res) {
    res.send(`Unfortunately this hosted HackathonPlanner is only available to members of ${organization.Name} organization.`);
});

router.get('/logout', function (req, res) {
    req.logout();
    res.redirect('/');
});

// Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.  If
//   the request is authenticated (typically via a persistent login session),
//   the request will proceed.  Otherwise, the user will be redirected to the
//   login page.
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) { 
        return next(); 
    }
    
    res.redirect('/auth/login')
}

module.exports = router;