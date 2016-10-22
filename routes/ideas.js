"use strict";

const express = require('express');
const router = express.Router();
const nconf = require("nconf");

const IdeaRepository = require("../repositories/IdeaRepository")
let ideaRepository = new IdeaRepository.default();

const Helpers = require('../utilities/Helpers');
let helpers = new Helpers.default();

const AdminRepository = require('../repositories/AdminRepository');
let adminRepository = new AdminRepository.default();

const IdeaPrePostProcessor = require('../services/IdeaPrePostProcessor');
let ideaPrePostProcessor = new IdeaPrePostProcessor.default();

let businessRules = nconf.get("BusinessRules");

router.use(function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    res.status(401).send('Unauthorized');
  }
});

router.post("/*join", function isJoinChangeAllowed(req, res, next) {
  if (businessRules.AllowJoins){
    next();
  } else{
    res.status(405).send('Team composition change is not allowed anymore');
  }
});

router.post("/like", function isLikeChangeAllowed(req, res, next) {
  if (businessRules.AllowLikes){
    next();
  } else{
    res.status(405).send('Liking or unliking ideas are not allowed anymore');
  }
});

router.post("/add|edit-title|edit-overview|edit-description", function isAddEditAllowed(req, res, next) {
  if (adminRepository.IsUserAdmin(req.user.username) || businessRules.AllowAddEdit){
    next();
  } else{
    res.status(405).send('Adding or editing ideas are not allowed anymore');
  }
});

router.get('/', function (req, res, next) {
  ideaRepository.GetAllIdeas(req.user)
    .then(ideas => res.json(ideas))
    .catch(err => {
      let errorMessage = `Unable to query. Error: ${JSON.stringify(err)}`;
      res.status(500).send(errorMessage);
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

module.exports = router;