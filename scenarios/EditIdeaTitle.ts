"use strict";

import { AsyncCommandHandler } from "../application/command-handler"
import container from "../application/command-handler-container";

import * as nconf from 'nconf';
import * as AWS from 'aws-sdk';
import * as Bluebird from 'bluebird';

import IdeaPrePostProcessor from '../services/IdeaPrePostProcessor';
const ideaPrePostProcessor = new IdeaPrePostProcessor();

import AdminRepository from '../repositories/AdminRepository';
const adminRepository = new AdminRepository();

class EditIdeaTitleHandler implements AsyncCommandHandler<EditIdeaTitleRequest, EditIdeaTitleResponse> {
    private adminRepository: IAdminRepository;

    constructor(adminRepository: IAdminRepository) {
        this.adminRepository = adminRepository;
    }

    async HandleAsync(request: EditIdeaTitleRequest): Promise<EditIdeaTitleResponse> {
        var docClient = Bluebird.promisifyAll(new AWS.DynamoDB.DocumentClient()) as AWS.DocumentAsyncClient;
        var ideaEntity = ideaPrePostProcessor.PreProcess(request.idea);

        let canModifyIdea = await this.CanModifyIdea(ideaEntity, request.user);
        if (!canModifyIdea) {
            throw new Error("Action is not authorized!");
        }

        const dbConfig = nconf.get("DynamoDb");
        var params = {
            TableName: dbConfig.IdeasTableName,
            Key: {
                id: ideaEntity.id
            },
            UpdateExpression: "set title = :t",
            ExpressionAttributeValues: {
                ":t": ideaEntity.title
            },
            ReturnValues: "UPDATED_NEW",
            AttributeUpdates: undefined
        };

        await docClient.updateAsync(params);

        return new EditIdeaTitleResponse();
    }

    private async CanModifyIdea(idea: IIdeaEntity, user: ILoggedOnUser): Promise<boolean> {
        if (adminRepository.IsUserAdmin(user.username)){
            return true;
        }

        let isOwner = await this.IsUserOwnerOfIdea(idea, user);
        return isOwner;
    }

    private async IsUserOwnerOfIdea(idea: IIdeaEntity, user: ILoggedOnUser): Promise<boolean> {
        if (typeof idea.user === "undefined") {
            // Fetch the idea from the database
            idea = await this.GetIdea(idea.id, user);
        }

        return idea.user.id === user.id;
    }

    private async GetIdea(ideaId: string, user: ILoggedOnUser): Promise<IIdeaEntity> {
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

export class EditIdeaTitleRequest {
    idea: IIdea;
    user: ILoggedOnUser;
}

export class EditIdeaTitleResponse {
}

// Register the handler to the request
let handler = new EditIdeaTitleHandler(adminRepository);
container.RegisterAsyncHandler(EditIdeaTitleRequest, handler);