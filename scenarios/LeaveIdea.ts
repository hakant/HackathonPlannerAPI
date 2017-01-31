"use strict";

import { AsyncCommandHandler } from "../application/command-handler"
import container from "../application/command-handler-container";
import JoinLeaveHandlerBase from "./JoinLeaveHandlerBase";

import * as nconf from 'nconf';
import * as AWS from 'aws-sdk';
import * as Bluebird from 'bluebird';
import * as _ from 'underscore';

import IdeaPrePostProcessor from '../services/IdeaPrePostProcessor';
const ideaPrePostProcessor = new IdeaPrePostProcessor();

class LeaveIdeaHandler extends JoinLeaveHandlerBase implements AsyncCommandHandler<LeaveIdeaRequest, LeaveIdeaResponse> {

    async HandleAsync(request: LeaveIdeaRequest): Promise<LeaveIdeaResponse> {

        await this.UnJoinIdea(request.ideaId, request.user);

        return new LeaveIdeaResponse();
    }
}

export class LeaveIdeaRequest {
    ideaId: string;
    user: ILoggedOnUser;
}

export class LeaveIdeaResponse {
}

// Register the handler to the request
let handler = new LeaveIdeaHandler();
container.RegisterAsyncHandler(LeaveIdeaRequest, handler);