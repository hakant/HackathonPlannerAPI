"use strict;"

import * as express from 'express';
import * as passport from 'passport';
import * as nconf from 'nconf';
import { RouteConfigurator } from './RouteConfigurator'

const router = express.Router() as express.Router;
const organization = nconf.get("Organization");
const host = nconf.get("HostInfo");


class AuthenticationRouteConfigurator implements RouteConfigurator {

    public configure(path:string, app: express.Application) {

        router.get('/', (req, res) => {
            res.json(req.user);
        });

        router.get('/account', this.ensureAuthenticated, (req, res) => {
            res.json(req.user);
        });

        router.get('/login', (req, res) => {
            res.json(req.user);
        });

        // GET /auth/github
        //   Use passport.authenticate() as route middleware to authenticate the
        //   request.  The first step in GitHub authentication will involve redirecting
        //   the user to github.com.  After authorization, GitHub will redirect the user
        //   back to this application at /auth/github/callback
        router.get('/github',
            passport.authenticate('github', { scope: ['user:email', 'read:org'] }),
            (req, res) => {
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

        router.get('/error', (req, res) => {
            res.send(`Unfortunately this hosted HackathonPlanner is only available to members of ${organization.Name} organization.`);
        });

        router.get('/logout', (req, res) => {
            req.logout();
            res.redirect('/');
        });

        app.use(path, router);

    }

    // Simple route middleware to ensure user is authenticated.
    //   Use this route middleware on any resource that needs to be protected.  If
    //   the request is authenticated (typically via a persistent login session),
    //   the request will proceed.  Otherwise, the user will be redirected to the
    //   login page.
    private ensureAuthenticated(req, res, next) {
        if (req.isAuthenticated()) {
            return next();
        }

        res.status(401).send('Unauthorized');
    }

}

export default new AuthenticationRouteConfigurator();


