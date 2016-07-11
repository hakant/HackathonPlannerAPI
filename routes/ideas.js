"use strict";

const Promise = require('bluebird');
const express = require('express');
const router = express.Router();
const AWS = require("aws-sdk");

var testService = require('../services/test-service');
testService = new testService();

/* GET home page. */
router.get('/', function (req, res, next) {
  //var docClient = Promise.promisifyAll(new AWS.DynamoDB.DocumentClient());
  var docClient = new AWS.DynamoDB.DocumentClient();

  var params = {
    TableName: "Ideas"
  };

  docClient.scan(params, function (err, data) {
    if (err) {
      console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
    } else {
      console.log("Query succeeded.");
      res.json(data.Items);
    }
  });
});

router.get("/greet", function (req, res, next) {
  let test = testService.Greet();
  res.send(test);
});

router.post("/", function (req, res, next) {
  var docClient = Promise.promisifyAll(new AWS.DynamoDB.DocumentClient());

  var params = {
    TableName: "Ideas",
    Item: req.body
  };

  console.log("Adding a new item...");
  console.log(req.body);
  docClient.putAsync(params).then(function (data) {
    console.log("Added item:", JSON.stringify(data, null, 2));
    }, function(err){
      console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
    });

    res.sendStatus(200);
});


module.exports = router;