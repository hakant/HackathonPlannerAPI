"use strict";

import * as express from 'express';
const router = express.Router();

import * as nconf from 'nconf';
let businessRules = nconf.get("BusinessRules");

import IdeaRepository from "../repositories/IdeaRepository";
let ideaRepository = new IdeaRepository();

import Helpers from '../utilities/Helpers';
let helpers = new Helpers();

import AdminRepository from '../repositories/AdminRepository';
let adminRepository = new AdminRepository;

import IdeaPrePostProcessor from '../services/IdeaPrePostProcessor';
let ideaPrePostProcessor = new IdeaPrePostProcessor();

import { RouteConfigurator } from './RouteConfigurator'

// CommandPattern dependencies
import application from "../application/application";
import { GetIdeasRequest, GetIdeasResponse } from "../scenarios/GetIdeas";

function catchAsyncErrors(fn) {  
    return (req, res, next) => {
        const routePromise = fn(req, res, next);
        if (routePromise.catch) {
            routePromise.catch(err => next(err));
        }
    }
}

class IdeasRouteConfigurator implements RouteConfigurator {

  public configure(path: string, app: express.Application) {

    router.use(function ensureAuthenticated(req, res, next) {
      if (req.isAuthenticated()) {
        return next();
      } else {
        res.status(401).send('Unauthorized');
      }
    });

    router.post("/*join", function isJoinChangeAllowed(req, res, next) {
      if (businessRules.AllowJoins) {
        next();
      } else {
        res.status(405).send('Team composition change is not allowed anymore');
      }
    });

    router.post("/like", function isLikeChangeAllowed(req, res, next) {
      if (businessRules.AllowLikes) {
        next();
      } else {
        res.status(405).send('Liking or unliking ideas are not allowed anymore');
      }
    });

    router.post("/add|edit-title|edit-overview|edit-description", function isAddEditAllowed(req, res, next) {
      if (adminRepository.IsUserAdmin(req.user.username) || businessRules.AllowAddEdit) {
        next();
      } else {
        res.status(405).send('Adding or editing ideas are not allowed anymore');
      }
    });

    router.get('/', catchAsyncErrors(async function (req, res, next) {

      var request = new GetIdeasRequest();
      request.user = req.user;

      var response = await application.ExecuteAsync<GetIdeasRequest, GetIdeasResponse>(request);
      res.json(response.ideas);

    }));

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

export default new IdeasRouteConfigurator();

