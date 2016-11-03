"use strict;"

import * as express from 'express';

export interface RouteConfigurator {

    configure(path:string, app: express.Application);

}

