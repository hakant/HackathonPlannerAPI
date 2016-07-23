"use strict";

const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const https = require('https');
const _ = require('underscore');

var GITHUB_CLIENT_ID = "542d0f0fafe92d2064a2";
var GITHUB_CLIENT_SECRET = "0901851d9ce1207e927b98b75602435bce106e3d";

class GitHubAuthSetup {

    constructor(app) {
        this._app = app;
    }

    Setup() {

        // Passport session setup.
        //   To support persistent login sessions, Passport needs to be able to
        //   serialize users into and deserialize users out of the session.  Typically,
        //   this will be as simple as storing the user ID when serializing, and finding
        //   the user by ID when deserializing.  However, since this example does not
        //   have a database of user records, the complete GitHub profile is serialized
        //   and deserialized.
        passport.serializeUser(function (user, done) {
            done(null, user);
        });

        passport.deserializeUser(function (obj, done) {
            done(null, obj);
        });

        // Use the GitHubStrategy within Passport.
        //   Strategies in Passport require a `verify` function, which accept
        //   credentials (in this case, an accessToken, refreshToken, and GitHub
        //   profile), and invoke a callback with a user object.
        passport.use(new GitHubStrategy({
            clientID: GITHUB_CLIENT_ID,
            clientSecret: GITHUB_CLIENT_SECRET,
            callbackURL: "http://localhost:3000/auth/github/callback"
        },
            function (accessToken, refreshToken, profile, done) {
                // asynchronous verification, for effect...
                process.nextTick(function () {
                    return https.get({
                        host: 'api.github.com',
                        //path: `/users/${profile.username}/orgs`,
                        path: `/user/orgs`,
                        headers: {
                            "Authorization": `token ${accessToken}`,
                            "User-Agent": "nodejs-http"
                        }
                    }, (response) => {
                        var body = '';
                        response.on('data', (d) => {
                            body += d 
                        });
                        response.on('end', () => {
                            var orgs = JSON.parse(body);
                            if (_.some(orgs, (org) => { return org.id === 11661932 })){
                                // NIPOSoftwareBV
                                return done(null, profile);
                            } else {
                                // TODO: How to display error message here? Look into passportjs
                                return done({
                                    error: `User ${profile.username} does not belong to NIPOSoftwareBV`
                                }, null);
                            }
                        });
                    });
                });
            }
        ));

        this._app.use(passport.initialize());
        this._app.use(passport.session());
    }
}

module.exports = GitHubAuthSetup;
