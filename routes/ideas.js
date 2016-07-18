"use strict";

const Promise = require('bluebird');
const express = require('express');
const router = express.Router();
const AWS = require("aws-sdk");

const Helpers = require('../utilities/helpers');
let helpers = new Helpers();

const IdeaPrePostProcessor = require('../services/idea-pre-post-processor');
let ideaPrePostProcessor = new IdeaPrePostProcessor();

const tableName = "Ideas";

router.get('/', function (req, res, next) {
  var docClient = Promise.promisifyAll(new AWS.DynamoDB.DocumentClient());

  var params = {
    TableName: tableName
  };

  docClient.scanAsync(params)
  .then(data => {
    console.log("Query succeeded.");

    data.Items.forEach(idea => {
        ideaPrePostProcessor.PostProcess(idea);
      });

    res.json(data.Items);
  }) 
  .catch(err => {
    let errorMessage = `Unable to query. Error: ${JSON.stringify(err)}`;
    res.status(500).send(errorMessage);
  });
});

router.post("/add", function (req, res, next) {
  var docClient = Promise.promisifyAll(new AWS.DynamoDB.DocumentClient());
  var idea = ideaPrePostProcessor.PreProcess(req.body);

  var params = {
    TableName: tableName,
    Item: idea
  };

  docClient.putAsync(params)
  .then(data => {
    res.sendStatus(200);
  })
  .catch(err => {
    let errorMessage = `Unable to add item. Error JSON: ${JSON.stringify(err)}`; 
    console.error(errorMessage);
    res.status(500).send(errorMessage);
  });
});

router.post("/edit-title", function (req, res, next) {
  var docClient = Promise.promisifyAll(new AWS.DynamoDB.DocumentClient());

  var idea = ideaPrePostProcessor.PreProcess(req.body);
  var params = {
    TableName: tableName,
    Key: {
      id: idea.id
    },
    UpdateExpression: "set title = :t",
    ExpressionAttributeValues:{
        ":t":idea.title
    },
    ReturnValues:"UPDATED_NEW"
  };

  docClient.updateAsync(params)
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
  var docClient = Promise.promisifyAll(new AWS.DynamoDB.DocumentClient());

  var idea = ideaPrePostProcessor.PreProcess(req.body);
  var params = {
    TableName: tableName,
    Key: {
      id: idea.id
    },
    UpdateExpression: "set overview = :o",
    ExpressionAttributeValues:{
        ":o":idea.overview
    },
    ReturnValues:"UPDATED_NEW"
  };

  docClient.updateAsync(params)
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
  var docClient = Promise.promisifyAll(new AWS.DynamoDB.DocumentClient());

  var idea = ideaPrePostProcessor.PreProcess(req.body);
  var params = {
    TableName: tableName,
    Key: {
      id: idea.id
    },
    UpdateExpression: "set description = :d",
    ExpressionAttributeValues:{
        ":d":idea.description
    },
    ReturnValues:"UPDATED_NEW"
  };

  docClient.updateAsync(params)
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
  var docClient = Promise.promisifyAll(new AWS.DynamoDB.DocumentClient());

  var posted = req.body;
  var params = {
    TableName: tableName,
    Key: {
      id: posted.ideaId
    },
    UpdateExpression: "set likedList = list_append (likedList, :userId)",
    ConditionExpression: "not contains (likedList, :userId)",
    ExpressionAttributeValues:{
        ":userId": [posted.userId]
    },
    ReturnValues:"UPDATED_NEW"
  };

  docClient.updateAsync(params)
  .then(data => {
    console.log("Updated likedList:", JSON.stringify(data));
    res.sendStatus(200);
  })
  .catch(err => {
    let errorMessage = `Unable to update item. Error JSON: ${JSON.stringify(err)}`; 
    console.error(errorMessage);
    res.status(500).send(errorMessage);
  });

});

router.post("/join", function (req, res, next) {
  var docClient = Promise.promisifyAll(new AWS.DynamoDB.DocumentClient());

  var posted = req.body;
  var params = {
    TableName: tableName,
    Key: {
      id: posted.ideaId
    },
    UpdateExpression: "set joinedList = list_append (joinedList, :userId)",
    ConditionExpression: "not contains (joinedList, :userId)",
    ExpressionAttributeValues:{
        ":userId": [posted.userId]
    },
    ReturnValues:"UPDATED_NEW"
  };

  docClient.updateAsync(params)
  .then(data => {
    console.log("Updated joinedlist:", JSON.stringify(data));
    res.sendStatus(200);
  })
  .catch(err => {
    let errorMessage = `Unable to update item. Error JSON: ${JSON.stringify(err)}`; 
    console.error(errorMessage);
    res.status(500).send(errorMessage);
  });

});



module.exports = router;