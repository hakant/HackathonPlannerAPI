"use strict";

const Promise = require('bluebird');
const express = require('express');
const router = express.Router();
const AWS = require("aws-sdk");

const Helpers = require('../utilities/helpers');

let helpers = new Helpers();

router.get('/', function (req, res, next) {
  var docClient = Promise.promisifyAll(new AWS.DynamoDB.DocumentClient());

  var params = {
    TableName: "Ideas"
  };

  docClient.scanAsync(params)
  .then(data => {
    console.log("Query succeeded.");

    data.Items.forEach(idea => {
        helpers.ReplacePropertyValuesOf(idea, null, "");
      });

    res.json(data.Items);
  }) 
  .catch(err => {
    let errorMessage = `Unable to query. Error: ${JSON.stringify(err)}`;
    res.status(500).send(errorMessage);
  });
});

router.post("/", function (req, res, next) {
  var docClient = Promise.promisifyAll(new AWS.DynamoDB.DocumentClient());

  var params = {
    TableName: "Ideas",
    Item: helpers.ReplacePropertyValuesOf(req.body, "", null)
  };

  docClient.putAsync(params)
  .then(data => {
    console.log("Added item:", JSON.stringify(data));
    res.sendStatus(200);
  })
  .catch(err => {
    let errorMessage = `Unable to add item. Error JSON: ${JSON.stringify(err)}`; 
    console.error(errorMessage);
    res.status(500).send(errorMessage);
  })
});

module.exports = router;