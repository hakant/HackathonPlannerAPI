"use strict";

import * as express from 'express';
const router = express.Router();

import { RouteConfigurator } from './RouteConfigurator'

class IndexRouteConfigurator implements RouteConfigurator {

    public configure(path: string, app: express.Application) {
        
        router.get('/', function (req, res, next) {
            res.render('index', { title: 'Hackathon Planner API' });
        });

        app.use(path, router);
    }

}

export default new IndexRouteConfigurator();