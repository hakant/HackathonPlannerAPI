"use strict";

import * as passport from 'passport';
import * as PassportGitHub from 'passport-github2';
const GitHubStrategy = PassportGitHub.Strategy;

import * as https from 'https';
import * as _ from 'underscore';
import * as nconf from 'nconf';

import AdminRepository from '../repositories/AdminRepository';
const adminRepository = new AdminRepository();

var config = nconf.get("GitHub_Auth");
var GITHUB_CLIENT_ID = config.ClientId;
var GITHUB_CLIENT_SECRET = config.ClientSecret;

config = nconf.get("HostInfo");
var HOST_URL = config.HostUrl;

var organization = nconf.get("Organization");

export default class GitHubAuthSetup {
    private _app : any;

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
            callbackURL: `${HOST_URL}/auth/github/callback`
        },
            function (accessToken, refreshToken, profile, done) {
                // asynchronous verification, for effect...
                process.nextTick(function () {
                    return https.get({
                        host: 'api.github.com',
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
                            var orgs : any[] = JSON.parse(body);
                            if (adminRepository.IsUserAdmin(profile.username)){
                                return done(null, profile);
                            }

                            if (_.some(orgs, (org) => { return org.id === organization.Id})){
                                return done(null, profile);
                            } else {
                                return done(null, false);
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
