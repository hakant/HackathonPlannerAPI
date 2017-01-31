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

class JoinIdeaHandler extends JoinLeaveHandlerBase implements AsyncCommandHandler<JoinIdeaRequest, JoinIdeaResponse> {

    async HandleAsync(request: JoinIdeaRequest): Promise<JoinIdeaResponse> {

        let businessRules = nconf.get("BusinessRules");

        let idea = await this.GetIdea(request.ideaId);

        if (idea.joinedList.length >= businessRules.MaxTeamSize) {
            throw new Error(`This project already has ${businessRules.MaxTeamSize} team members. ` +
                "Please select a different project.");
        }

        let ideas = await this.GetIdeasThatUserAlreadyJoined(request.user);
        ideas.map(async (idea) => {
            await this.UnJoinIdea(idea.id, request.user);
        });

        var index = _.findIndex(idea.joinedList, item => item.id === request.user.id);
        if (index < 0) {
            idea.joinedList.push({
                id: request.user.id,
                name: request.user.displayName,
                login: request.user.username
            });
        }

        await this.UpsertIdea(idea, request.user);

        return new JoinIdeaResponse();
    }
}

export class JoinIdeaRequest {
    ideaId: string;
    user: ILoggedOnUser;
}

export class JoinIdeaResponse {
}

// Register the handler to the request
let handler = new JoinIdeaHandler();
container.RegisterAsyncHandler(JoinIdeaRequest, handler);