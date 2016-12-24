"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
const express = require("express");
const router = express.Router();
const nconf = require("nconf");
let businessRules = nconf.get("BusinessRules");
const IdeaRepository_1 = require("../repositories/IdeaRepository");
let ideaRepository = new IdeaRepository_1.default();
const Helpers_1 = require("../utilities/Helpers");
let helpers = new Helpers_1.default();
const AdminRepository_1 = require("../repositories/AdminRepository");
let adminRepository = new AdminRepository_1.default;
const IdeaPrePostProcessor_1 = require("../services/IdeaPrePostProcessor");
let ideaPrePostProcessor = new IdeaPrePostProcessor_1.default();
// CommandPattern dependencies
const application_1 = require("../application/application");
const GetIdeas_1 = require("../scenarios/GetIdeas");
class IdeasRouteConfigurator {
    configure(path, app) {
        router.use(function ensureAuthenticated(req, res, next) {
            if (req.isAuthenticated()) {
                return next();
            }
            else {
                res.status(401).send('Unauthorized');
            }
        });
        router.post("/*join", function isJoinChangeAllowed(req, res, next) {
            if (businessRules.AllowJoins) {
                next();
            }
            else {
                res.status(405).send('Team composition change is not allowed anymore');
            }
        });
        router.post("/like", function isLikeChangeAllowed(req, res, next) {
            if (businessRules.AllowLikes) {
                next();
            }
            else {
                res.status(405).send('Liking or unliking ideas are not allowed anymore');
            }
        });
        router.post("/add|edit-title|edit-overview|edit-description", function isAddEditAllowed(req, res, next) {
            if (adminRepository.IsUserAdmin(req.user.username) || businessRules.AllowAddEdit) {
                next();
            }
            else {
                res.status(405).send('Adding or editing ideas are not allowed anymore');
            }
        });
        router.get('/', function (req, res, next) {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    var request = new GetIdeas_1.GetIdeasRequest();
                    request.user = req.user;
                    var response = yield application_1.default.ExecuteAsync(request);
                    res.json(response.ideas);
                }
                catch (err) {
                    let errorMessage = `Unable to query. Error: ${JSON.stringify(err)}`;
                    res.status(500).send(errorMessage);
                }
            });
        });
        router.post("/add", function (req, res, next) {
            ideaRepository.InsertIdea(req.body, req.user)
                .then(data => res.sendStatus(200))
                .catch(err => {
                let errorMessage = `Unable to add item. Error JSON: ${JSON.stringify(err)}`;
                console.log(errorMessage);
                res.status(500).send(errorMessage);
            });
        });
        router.post("/edit-title", function (req, res, next) {
            ideaRepository.EditTitle(req.body, req.user)
                .then(data => {
                console.log("Updated title:", JSON.stringify(data));
                res.sendStatus(200);
            })
                .catch(err => {
                let errorMessage = `Unable to update item. Error JSON: ${JSON.stringify(err)}`;
                console.error(errorMessage);
                res.status(500).send(errorMessage);
            });
        });
        router.post("/edit-overview", function (req, res, next) {
            ideaRepository.EditOverview(req.body, req.user)
                .then(data => {
                console.log("Updated overview:", JSON.stringify(data));
                res.sendStatus(200);
            })
                .catch(err => {
                let errorMessage = `Unable to update item. Error JSON: ${JSON.stringify(err)}`;
                console.error(errorMessage);
                res.status(500).send(errorMessage);
            });
        });
        router.post("/edit-description", function (req, res, next) {
            ideaRepository.EditDescription(req.body, req.user)
                .then(data => {
                console.log("Updated description:", JSON.stringify(data));
                res.sendStatus(200);
            })
                .catch(err => {
                let errorMessage = `Unable to update item. Error JSON: ${JSON.stringify(err)}`;
                console.error(errorMessage);
                res.status(500).send(errorMessage);
            });
        });
        router.post("/like", function (req, res, next) {
            ideaRepository.LikeIdea(req.body.ideaId, req.user)
                .then(data => {
                console.log("Updated likedList:", JSON.stringify(data));
                res.sendStatus(200);
            })
                .catch(err => {
                let errorMessage = `Unable to update item. Error JSON: ${err}`;
                console.error(errorMessage);
                console.error(err);
                res.status(500).send(errorMessage);
            });
        });
        router.post("/join", function (req, res, next) {
            ideaRepository.JoinIdea(req.body.ideaId, req.user)
                .then(data => {
                console.log("Updated joinedList:", JSON.stringify(data));
                res.sendStatus(200);
            })
                .catch(err => {
                let errorMessage = `Unable to update item. Error JSON: ${err}`;
                console.error(errorMessage);
                res.status(500).send(errorMessage);
            });
        });
        router.post("/unjoin", function (req, res, next) {
            ideaRepository.UnJoinIdea(req.body.ideaId, req.user)
                .then(data => {
                console.log("Updated joinedList:", JSON.stringify(data));
                res.sendStatus(200);
            })
                .catch(err => {
                let errorMessage = `Unable to update item. Error JSON: ${err}`;
                console.error(errorMessage);
                res.status(500).send(errorMessage);
            });
        });
        app.use(path, router);
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = new IdeasRouteConfigurator();
//# sourceMappingURL=Ideas.js.map