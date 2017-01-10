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

class InsertIdeaHandler implements AsyncCommandHandler<InsertIdeaRequest, InsertIdeaResponse> {
    private adminRepository: IAdminRepository;

    constructor(adminRepository: IAdminRepository) {
        this.adminRepository = adminRepository;
    }

    async HandleAsync(request: InsertIdeaRequest): Promise<InsertIdeaResponse> {
        var docClient = Bluebird.promisifyAll(new AWS.DynamoDB.DocumentClient()) as AWS.DocumentAsyncClient;
        var ideaEntity = ideaPrePostProcessor.PreProcess(request.idea);

        if (!this.adminRepository.IsUserAdmin(request.user.username)) {
            // Enforce the current user as the owner of the idea
            ideaEntity.user = {
                login: request.user.username,
                id: request.user.id,
                avatar_url: request.user._json.avatar_url,
                name: request.user.displayName
            };
        }

        const dbConfig = nconf.get("DynamoDb");

        var params = {
            TableName: dbConfig.IdeasTableName,
            Item: ideaEntity
        };

        var data = await docClient.putAsync(<any>params);

        return new InsertIdeaResponse();
    }   
}

export class InsertIdeaRequest { 
    idea: IIdea;
    user: ILoggedOnUser;
}

export class InsertIdeaResponse {
}

// Register the handler to the request
let handler = new InsertIdeaHandler(adminRepository);
container.RegisterAsyncHandler(InsertIdeaRequest, handler);