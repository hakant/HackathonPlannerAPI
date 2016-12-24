"use strict";
const express = require("express");
const cors = require("cors");
const path = require("path");
const favicon = require("serve-favicon");
const logger = require("morgan");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const session = require("express-session");
const nconf = require("nconf");
nconf.argv().env().file({ file: 'config.json' });
const GitHubAuthSetup_1 = require("./infrastructure/GitHubAuthSetup");
const DatabaseSetup_1 = require("./infrastructure/DatabaseSetup");
const Auth_1 = require("./routes/Auth");
const Ideas_1 = require("./routes/Ideas");
const Index_1 = require("./routes/Index");
class Server {
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
    static bootstrap() {
        return new Server();
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
    setupGitHubAuthentication() {
        GitHubAuthSetup_1.default.Setup(this.app);
    }
    setupDatabase() {
        DatabaseSetup_1.default.SetupNoSqlTables();
    }
    setupErrorHandling() {
        // catch 404 and forward to error handler
        this.app.use((req, res, next) => {
            res.status(404).send('Sorry, not found!');
        });
        // error handlers
        // development error handler
        // will print stacktrace
        if (this.app.get('env') === 'development') {
            this.app.use((err, req, res, next) => {
                res.status(err.status || 500);
                res.json({
                    message: err.message,
                    error: err
                });
            });
        }
        // production error handler
        // no stacktraces leaked to user
        this.app.use((err, req, res, next) => {
            res.status(err.status || 500);
            res.json({
                message: err.message,
                error: {}
            });
        });
    }
    configureRoutes() {
        Index_1.default.configure('/', this.app);
        Auth_1.default.configure('/auth', this.app);
        Ideas_1.default.configure('/ideas', this.app);
    }
    startListening() {
        this.app.listen(3000, function () {
            console.log('Hackathon Planner is listening on port 3000!');
        });
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Server;
var server = Server.bootstrap();
server.startListening();
//# sourceMappingURL=app.js.map