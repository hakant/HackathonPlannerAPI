"use strict";

import { AsyncCommandHandler } from "../application/command-handler"
import container from "../application/command-handler-container";

import * as AWS from 'aws-sdk';
import * as Bluebird from 'bluebird';
import * as _ from 'underscore';

import IdeaPrePostProcessor from '../services/IdeaPrePostProcessor';
const ideaPrePostProcessor = new IdeaPrePostProcessor();

const tableName = "Ideas";

class GetIdeasHandler implements AsyncCommandHandler<GetIdeasRequest, GetIdeasResponse> {

    async HandleAsync(request: GetIdeasRequest): Promise<GetIdeasResponse> {
        var docClient = Bluebird.promisifyAll(new AWS.DynamoDB.DocumentClient()) as AWS.DynamoDB.DocumentAsyncClient;

        var params = {
            TableName: tableName
        };

        var data = await docClient.scanAsync(params);
        var items = [];
        data.Items.forEach(idea => {
                    items.push(
                        ideaPrePostProcessor.PostProcess(idea, request.user)
                    );
                });

        var sortedItems = _.sortBy(items, (item) => ((-1 * item.likeCount) + (-2 * item.teamCount)));

        var result = new GetIdeasResponse();
        result.ideas = sortedItems;

        return result;
    }   
}

export class GetIdeasRequest { 
    user: ILoggedOnUser;
}

export class GetIdeasResponse {
    ideas: Array<IIdea>;
}

// Register the handler to the request
let handler = new GetIdeasHandler();
container.RegisterAsyncHandler(GetIdeasRequest, handler);