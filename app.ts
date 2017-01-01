"use strict";

import * as express from 'express';
import * as cors from 'cors';
import * as path from 'path';
import * as favicon from 'serve-favicon';
import * as logger from 'morgan';
import * as cookieParser from 'cookie-parser';
import * as bodyParser from 'body-parser';
import * as session from 'express-session';
import * as nconf from 'nconf';
nconf.argv().env().file({ file: 'config.json' });

import gitHubAuthSetup from "./infrastructure/GitHubAuthSetup";
import databaseSetup from "./infrastructure/DatabaseSetup";

import authenticationRouteConfigurator from './routes/Auth';
import ideasRouteConfigurator from './routes/Ideas';
import indexRouteConfigurator from './routes/Index';

export default class Server {

    public app: express.Application;

    public static bootstrap(): Server {
        return new Server();
    }

    constructor() {
        //create expressjs application
        this.app = express();

        //configure application
        this.configureApp();
        this.setupDatabase();
        this.setupGitHubAuthentication();
        this.configureRoutes();
        this.setupErrorHandling();
    }

    configureApp() {
        let host = nconf.get("HostInfo");
        let corsOptions = {
            origin: host.SPAUrl,
            methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
            credentials: true,
            preflightContinue: false
        };

        // uncomment after placing your favicon in /public
        this.app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
        this.app.use(cors(corsOptions));
        this.app.use(logger('dev'));
        this.app.use(bodyParser.json());
        this.app.use(bodyParser.urlencoded({ extended: false }));
        this.app.use(cookieParser());
        this.app.use(session({ secret: 'hakans planner hackathon', resave: false, saveUninitialized: false }));
        this.app.use(express.static(path.join(__dirname, 'public')));

        // setup view engine
        this.app.set('views', path.join(__dirname, 'views'));
        this.app.set('view engine', 'jade');
    }

    setupGitHubAuthentication(){
        gitHubAuthSetup.Setup(this.app);
    }

    setupDatabase(){
        var config = nconf.get("DynamoDb");
        databaseSetup.SetupNoSqlTables(config.IdeasTableName);
    }

    setupErrorHandling(){
        // catch 404 and forward to error handler
        this.app.use(
            (req: express.Request, res: express.Response, next: express.NextFunction) => {
                res.status(404).send('Sorry, not found!');
            });

        // error handlers

        // development error handler
        // will print stacktrace
        if (this.app.get('env') === 'development') {
            this.app.use(
                (err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
                    console.error(`Unhandled error occurred: ${err}`);
                    res.status(err.status || 500);
                    res.json({
                        message: err.message,
                        error: err
                    });
                });
        }

        // production error handler
        // no stacktraces leaked to user
        this.app.use(
            (err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
                res.status(err.status || 500);
                res.json({
                    message: err.message,
                    error: {}
                });
            });
    }

    configureRoutes(){
        indexRouteConfigurator.configure('/', this.app);
        authenticationRouteConfigurator.configure('/auth', this.app);
        ideasRouteConfigurator.configure('/ideas', this.app);
    }

    startListening(){
        this.app.listen(3000, function () {
            console.log('Hackathon Planner is listening on port 3000!');
        });
    }
}

var server = Server.bootstrap();
server.startListening();
