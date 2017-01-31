"use strict";

import * as express from 'express';
const router = express.Router();

import * as nconf from 'nconf';
let businessRules = nconf.get("BusinessRules");

import AdminRepository from '../repositories/AdminRepository';
let adminRepository = new AdminRepository;

import { RouteConfigurator } from './RouteConfigurator'

// CommandPattern dependencies
import application from "../application/application";
import { GetIdeasRequest, GetIdeasResponse } from "../scenarios/GetIdeas";
import { InsertIdeaRequest, InsertIdeaResponse } from "../scenarios/InsertIdea";
import { EditIdeaRequest, EditIdeaResponse, EditMode } from "../scenarios/EditIdea";
import { ToggleIdeaLikeRequest, ToggleIdeaLikeResponse } from "../scenarios/ToggleIdeaLike";
import { JoinIdeaRequest, JoinIdeaResponse } from "../scenarios/JoinIdea";
import { LeaveIdeaRequest, LeaveIdeaResponse } from "../scenarios/LeaveIdea";

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

    router.post("/add", catchAsyncErrors(async function (req, res, next) {

      var request = new InsertIdeaRequest();
      request.user = req.user;
      request.idea = <IIdea>req.body;

      await application.ExecuteAsync<InsertIdeaRequest, InsertIdeaResponse>(request);
      res.sendStatus(200);

    }));

    router.post("/edit-title", catchAsyncErrors(async function (req, res, next) {

      var request = new EditIdeaRequest();
      request.user = req.user;
      request.idea = <IIdea>req.body;
      request.mode = EditMode.Title;

      await application.ExecuteAsync<EditIdeaRequest, EditIdeaResponse>(request);
      res.sendStatus(200);

    }));

    router.post("/edit-overview", catchAsyncErrors(async function (req, res, next) {

      var request = new EditIdeaRequest();
      request.user = req.user;
      request.idea = <IIdea>req.body;
      request.mode = EditMode.Overview;

      await application.ExecuteAsync<EditIdeaRequest, EditIdeaResponse>(request);
      res.sendStatus(200);

    }));

    router.post("/edit-description", catchAsyncErrors(async function (req, res, next) {

      var request = new EditIdeaRequest();
      request.user = req.user;
      request.idea = <IIdea>req.body;
      request.mode = EditMode.Description;

      await application.ExecuteAsync<EditIdeaRequest, EditIdeaResponse>(request);
      res.sendStatus(200);

    }));

    router.post("/like", catchAsyncErrors(async function (req, res, next) {

      var request = new ToggleIdeaLikeRequest();
      request.user = req.user;
      request.ideaId = req.body.ideaId

      await application.ExecuteAsync<ToggleIdeaLikeRequest, ToggleIdeaLikeResponse>(request);
      res.sendStatus(200);

    }));

    router.post("/join", catchAsyncErrors(async function (req, res, next) {

      var request = new JoinIdeaRequest();
      request.user = req.user;
      request.ideaId = req.body.ideaId

      await application.ExecuteAsync<JoinIdeaRequest, JoinIdeaResponse>(request);
      res.sendStatus(200);

    }));

    router.post("/unjoin", catchAsyncErrors(async function (req, res, next) {

      var request = new LeaveIdeaRequest();
      request.user = req.user;
      request.ideaId = req.body.ideaId

      await application.ExecuteAsync<LeaveIdeaRequest, LeaveIdeaResponse>(request);
      res.sendStatus(200);

    }));

    app.use(path, router);
  }
}

export default new IdeasRouteConfigurator();

