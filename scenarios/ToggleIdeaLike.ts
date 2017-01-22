"use strict";

import { AsyncCommandHandler } from "../application/command-handler"
import container from "../application/command-handler-container";

import * as nconf from 'nconf';
import * as AWS from 'aws-sdk';
import * as Bluebird from 'bluebird';
import * as _ from 'underscore';

import IdeaPrePostProcessor from '../services/IdeaPrePostProcessor';
const ideaPrePostProcessor = new IdeaPrePostProcessor();

class ToggleIdeaLikeHandler implements AsyncCommandHandler<ToggleIdeaLikeRequest, ToggleIdeaLikeResponse> {

    async HandleAsync(request: ToggleIdeaLikeRequest): Promise<ToggleIdeaLikeResponse> {
        let idea = await this.GetIdea(request.ideaId);

        let index = _.findIndex(idea.likedList, item => item.id === request.user.id);
        if (index > -1) {
            idea.likedList.splice(index, 1);
        } else {
            idea.likedList.push({
                id: request.user.id,
                name: request.user.displayName,
                login: request.user.username
            });
        }

        let ideaEntity = ideaPrePostProcessor.PreProcess(idea);

        let docClient = Bluebird.promisifyAll(new AWS.DynamoDB.DocumentClient()) as AWS.DocumentAsyncClient;
        const dbConfig = nconf.get("DynamoDb");

        let putParams = {
            TableName: dbConfig.IdeasTableName,
            Item: ideaEntity
        };

        await docClient.putAsync(putParams);

        return new ToggleIdeaLikeResponse();
    }

    private async GetIdea(ideaId: string): Promise<IIdeaEntity> {
        var docClient = Bluebird.promisifyAll(new AWS.DynamoDB.DocumentClient()) as AWS.DocumentAsyncClient;

        const dbConfig = nconf.get("DynamoDb");
        var params = {
            TableName: dbConfig.IdeasTableName,
            Key: {
                id: ideaId
            }
        };

        let data = await docClient.getAsync(params);

        return <IIdeaEntity>data.Item;
    }
}

export class ToggleIdeaLikeRequest {
    ideaId: string;
    user: ILoggedOnUser;
}

export class ToggleIdeaLikeResponse {
}

// Register the handler to the request
let handler = new ToggleIdeaLikeHandler();
container.RegisterAsyncHandler(ToggleIdeaLikeRequest, handler);