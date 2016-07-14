"use strict";

const Promise = require('bluebird');
const express = require('express');
const router = express.Router();
const AWS = require("aws-sdk");

const Helpers = require('../utilities/helpers');

let helpers = new Helpers();

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
      data.Items.forEach(function (idea) {
        helpers.ReplacePropertyValuesOf(idea, null, "");
      });
      res.json(data.Items);
    }
  });
});

router.post("/", function (req, res, next) {
  var docClient = Promise.promisifyAll(new AWS.DynamoDB.DocumentClient());

  var params = {
    TableName: "Ideas",
    Item: helpers.ReplacePropertyValuesOf(req.body, "", null)
  };

  docClient.putAsync(params).then(function (data) {
    console.log("Added item:", JSON.stringify(data));
    }, function(err){
      console.error("Unable to add item. Error JSON:", JSON.stringify(err));
    });

    res.sendStatus(200);
});




module.exports = router;