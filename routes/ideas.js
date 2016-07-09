"use strict";

var express = require('express'); 
var router = express.Router();

var testService = require('../services/test-service');
testService = new testService();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.send([{
  "id": 1,
  "user": {
    "login": "hakant",
    "id": 1907367,
    "avatar_url": "https://avatars.githubusercontent.com/u/1907367?v=3",
    "name": "Hakan Tuncer"
  },
  "title": "Hackathon Planner",
  "overview": "Create a fun & useful environment where hackathon ideas can live and team formations around those ideas can be managed.",
  "description": "## Hackathons\n\n[Hackathons](https://en.wikipedia.org/wiki/Hackathon) are a great way of [learning by doing](http://news.uchicago.edu/article/2015/04/29/learning-doing-helps-students-perform-better-science) and we at [NIPO Software](http://niposoftware.com/) have started making this a company tradition for a year or so, thanks to my colleague [Qa'id Jacobs](https://twitter.com/qaidj) who took the first initiative and continues to put effort into organizing them. Below are some pictures from our last hackathon around summer of 2015.\n\n![NIPO Software Summer 2015 Hackathon 1](http://hakantuncer.com/assets/Hackathon_Planner/Hackathon_NIPO_1.jpg =95%x95%)\n\n![NIPO Software Summer 2015 Hackathon 2](http://hakantuncer.com/assets/Hackathon_Planner/Hackathon_NIPO_2.jpg =95%x95%)\n\n![NIPO Software Summer 2015 Hackathon 3](http://hakantuncer.com/assets/Hackathon_Planner/Hackathon_NIPO_3.jpg =95%x95%)\n\nOne of the ideas during this hackathon was building a \"Hackathon Planner\". It didn't get enough love, so was never picked up. Currently all ideas and team compositions are kept and maintained in an Excel file - the best and the worst tool of all times in computing history. So how about building a planner that can help people capturing ideas and forming teams around those ideas in a fun way?\n\n## A Hackathon Planner - [MVP](https://en.wikipedia.org/wiki/Minimum_viable_product)\n\nA minimum viable hackathon planner;\n\n* should be open source (not only [NIPO Software](http://niposoftware.com/), anyone or any company should be able to make use of it if they want to do so).\n* should allow capturing of ideas in a modern way (I hear [SPAs](https://en.wikipedia.org/wiki/Single-page_application), [Markdown](https://en.wikipedia.org/wiki/Markdown), subtle animations, web sockets, responsive design).\n* should allow simple ways of reacting to those ideas (i.e sending likes and possibly comments in the future).\n* should be simple to sign up and login (built in GitHub authentication?).\n* should allow a simple way of forming teams (mark the idea/team that you want to join and done!).\n* should allow live monitoring of teams as they form and evolve. It makes the team formation process more exciting to follow. Watching as ideas live and die ([signalR](http://www.asp.net/signalr),  [socket.io](http://socket.io/) ?).\n\n## Ingredients\n\nI'm very much into [Aurelia](http://aurelia.io/) and [node.js](https://nodejs.org/) these days. So that's what I'll be using. Sure I'll throw in a NoSQL database too and see how much these decisions will hurt me during production.",
  "labels": ["hackathon", "aurelia", "node.js"],
  "like-count": 29,
  "team-count": 5,
  "liked":false,
  "joined": false
}]);
});

router.get("/greet", function(req, res, next){
    let test = testService.Greet();
    res.send(test);
});


module.exports = router;