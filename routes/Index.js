"use strict";
const express = require("express");
const router = express.Router();
class IndexRouteConfigurator {
    configure(path, app) {
        router.get('/', function (req, res, next) {
            res.render('index', { title: 'Hackathon Planner API' });
        });
        app.use(path, router);
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = new IndexRouteConfigurator();
//# sourceMappingURL=Index.js.map