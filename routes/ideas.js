"use strict";

const express = require('express');
const router = express.Router();

const IdeaRepository = require("../repositories/idea-repository")
let ideaRepository = new IdeaRepository();
const Helpers = require('../utilities/helpers');
let helpers = new Helpers();
const IdeaPrePostProcessor = require('../services/idea-pre-post-processor');
let ideaPrePostProcessor = new IdeaPrePostProcessor();

router.get('/', function (req, res, next) {
  ideaRepository.GetAllIdeas()
    .then(ideas => res.json(ideas))
    .catch(err => {
      let errorMessage = `Unable to query. Error: ${ JSON.stringify(err) }`;
      res.status(500).send(errorMessage);
    });
});

router.post("/add", function (req, res, next) {
  ideaRepository.UpsertIdea(req.body)
    .then(data => res.sendStatus(200))
    .catch(err => {
      let errorMessage = `Unable to add item. Error JSON: ${JSON.stringify(err)}`;
      console.log(errorMessage);
      res.status(500).send(errorMessage);
    });
});

router.post("/edit-title", function (req, res, next) {
  ideaRepository.EditTitle(req.body)
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
  ideaRepository.EditOverview(req.body)
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
  ideaRepository.EditDescription(req.body)
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
  ideaRepository.LikeIdea(req.body.ideaId, req.body.userId)
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
  ideaRepository.JoinIdea(req.body.ideaId, req.body.userId)
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
  ideaRepository.UnJoinIdea(req.body.ideaId, req.body.userId)
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