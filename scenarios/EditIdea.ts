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

class EditIdeaHandler implements AsyncCommandHandler<EditIdeaRequest, EditIdeaResponse> {
    private adminRepository: IAdminRepository;

    constructor(adminRepository: IAdminRepository) {
        this.adminRepository = adminRepository;
    }

    async HandleAsync(request: EditIdeaRequest): Promise<EditIdeaResponse> {
        var docClient = Bluebird.promisifyAll(new AWS.DynamoDB.DocumentClient()) as AWS.DocumentAsyncClient;
        var ideaEntity = ideaPrePostProcessor.PreProcess(request.idea);

        let canModifyIdea = await this.CanModifyIdea(ideaEntity, request.user);
        if (!canModifyIdea) {
            throw new Error("Action is not authorized!");
        }

        const dbConfig = nconf.get("DynamoDb");
        var params : AWS.DynamoDB.DocumentClient.UpdateItemInput = {
            TableName: dbConfig.IdeasTableName,
            Key: {
                id: ideaEntity.id
            },
            ReturnValues: "UPDATED_NEW",
            AttributeUpdates: undefined
        };

        switch (request.mode) {
            case EditMode.Title: {
                params.UpdateExpression = "set title = :p";
                params.ExpressionAttributeValues = {
                    ":p": ideaEntity.title
                };
                break;
            }
            case EditMode.Overview: {
                params.UpdateExpression = "set overview = :p";
                params.ExpressionAttributeValues = {
                    ":p": ideaEntity.overview
                };
                break;
            }
            case EditMode.Description: {
                params.UpdateExpression = "set description = :p";
                params.ExpressionAttributeValues = {
                    ":p": ideaEntity.description
                };
                break;
            }
        }

        await docClient.updateAsync(params);

        return new EditIdeaResponse();
    }

    private async CanModifyIdea(idea: IIdeaEntity, user: ILoggedOnUser): Promise<boolean> {
        if (adminRepository.IsUserAdmin(user.username)) {
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

export enum EditMode {
    Title,
    Overview,
    Description
}

export class EditIdeaRequest {
    idea: IIdea;
    user: ILoggedOnUser;
    mode: EditMode;
}

export class EditIdeaResponse {
}

// Register the handler to the request
let handler = new EditIdeaHandler(adminRepository);
container.RegisterAsyncHandler(EditIdeaRequest, handler);