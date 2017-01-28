"use strict";

import * as nconf from 'nconf';
import * as AWS from 'aws-sdk';
import * as Bluebird from 'bluebird';
import * as _ from 'underscore';

import IdeaPrePostProcessor from '../services/IdeaPrePostProcessor';
const ideaPrePostProcessor = new IdeaPrePostProcessor();

export default class JoinLeaveHandlerBase {

    protected async GetIdea(ideaId: string): Promise<IIdeaEntity> {
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

    protected async GetIdeasThatUserAlreadyJoined(user: ILoggedOnUser): Promise<Array<IIdeaEntity>> {
        var docClient = Bluebird.promisifyAll(new AWS.DynamoDB.DocumentClient()) as AWS.DocumentAsyncClient;
        const dbConfig = nconf.get("DynamoDb");

        // TODO: Is there a better way of filtering this already in the database?
        var params = {
            TableName: dbConfig.IdeasTableName,
            ProjectionExpression: "id, joinedList",
        };

        let items: Array<IIdeaEntity> = [];
        let data = await docClient.scanAsync(params);

        data.Items.forEach((item: IIdeaEntity) => {
            if (_.some(item.joinedList, i => i.id === user.id)) {
                items.push(item);
            }
        });

        return items;
    }

    protected async UnJoinIdea(ideaId: string, user: ILoggedOnUser): Promise<any> {
        let idea = await this.GetIdea(ideaId);

        var index = _.findIndex(idea.joinedList, item => item.id === user.id);
        if (index > -1) {
            idea.joinedList.splice(index, 1);
        }

        await this.UpsertIdea(idea, user);
    }

    protected async UpsertIdea(idea: IIdeaEntity, user: ILoggedOnUser): Promise<any> {
        var docClient = Bluebird.promisifyAll(new AWS.DynamoDB.DocumentClient()) as AWS.DocumentAsyncClient;
        const dbConfig = nconf.get("DynamoDb");

        var ideaEntity = ideaPrePostProcessor.PreProcess(idea);

        var params = {
            TableName: dbConfig.IdeasTableName,
            Item: ideaEntity
        };

        return await docClient.putAsync(params);
    }
}