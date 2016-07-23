"use strict";

const AWS = require("aws-sdk");
const Promise = require('bluebird');
const _ = require('underscore');
const IdeaPrePostProcessor = require('../services/idea-pre-post-processor');

const ideaPrePostProcessor = new IdeaPrePostProcessor();
const tableName = "Ideas";

class IdeaRepository {

    constructor() {
        this.ideaPrePostProcessor = ideaPrePostProcessor;
        this.tableName = tableName;
    }

    GetAllIdeas() {
        var docClient = Promise.promisifyAll(new AWS.DynamoDB.DocumentClient());

        var params = {
            TableName: this.tableName
        };

        return docClient.scanAsync(params)
            .then(data => {
                data.Items.forEach(idea => {
                    ideaPrePostProcessor.PostProcess(idea);
                });

                return data.Items;
            });
    }

    GetIdea(ideaId) {
        var docClient = Promise.promisifyAll(new AWS.DynamoDB.DocumentClient());

        var params = {
            TableName: this.tableName,
            Key: {
                id: ideaId
            }
        };

        return docClient.getAsync(params)
            .then(data => {
                return ideaPrePostProcessor.PostProcess(data.Item);
            })
    }

    UpsertIdea(idea) {
        var docClient = Promise.promisifyAll(new AWS.DynamoDB.DocumentClient());

        var params = {
            TableName: tableName,
            Item: idea
        };

        return docClient.putAsync(params)
            .then(data => {
                return data;
            });
    }

    EditTitle(idea) {
        var docClient = Promise.promisifyAll(new AWS.DynamoDB.DocumentClient());

        var params = {
            TableName: tableName,
            Key: {
                id: idea.id
            },
            UpdateExpression: "set title = :t",
            ExpressionAttributeValues: {
                ":t": idea.title
            },
            ReturnValues: "UPDATED_NEW"
        };

        return docClient.updateAsync(params)
            .then(data => {
                return data;
            })
    }

    EditOverview(idea) {
        var docClient = Promise.promisifyAll(new AWS.DynamoDB.DocumentClient());

        var params = {
            TableName: tableName,
            Key: {
                id: idea.id
            },
            UpdateExpression: "set overview = :o",
            ExpressionAttributeValues: {
                ":o": idea.overview
            },
            ReturnValues: "UPDATED_NEW"
        };

        return docClient.updateAsync(params)
            .then(data => {
                return data;
            })
    }

    EditDescription(idea) {
        var docClient = Promise.promisifyAll(new AWS.DynamoDB.DocumentClient());

        var params = {
            TableName: tableName,
            Key: {
                id: idea.id
            },
            UpdateExpression: "set description = :d",
            ExpressionAttributeValues: {
                ":d": idea.description
            },
            ReturnValues: "UPDATED_NEW"
        };

        return docClient.updateAsync(params)
            .then(data => {
                return data;
            })
    }

    LikeIdea(ideaId, userId) {
        return this.GetIdea(ideaId)
            .then(idea => {
                var index = _.indexOf(idea.likedList, userId);
                if (index > -1) {
                    idea.likedList.splice(index, 1);
                } else {
                    idea.likedList.push(userId);
                }
                return idea;
            }).then(idea => {
                return this.UpsertIdea(idea);
            });
    }

    JoinIdea(ideaId, userId) {
        return this.GetIdeasThatUserAlreadyJoined(userId)
            .then(ideas => {
                // todo: execute all of these in a promise.all aggregator
                return Promise.all(ideas.map((idea) => {
                    return this.UnJoinIdea(idea.id, userId);
                }));
            })
            .then(() => {
                return this.GetIdea(ideaId);
            })
            .then(idea => {
                var index = _.indexOf(idea.joinedList, userId);
                if (index < 0) {
                    idea.joinedList.push(userId);
                }
                return idea;
            }).then(idea => {
                return this.UpsertIdea(idea);
            });
    }

    UnJoinIdea(ideaId, userId) {
        return this.GetIdea(ideaId)
            .then(idea => {
                var index = _.indexOf(idea.joinedList, userId);
                if (index > -1) {
                    idea.joinedList.splice(index, 1);
                }
                return idea;
            }).then(idea => {
                return this.UpsertIdea(idea);
            });
    }

    GetIdeasThatUserAlreadyJoined(userId){
        var docClient = Promise.promisifyAll(new AWS.DynamoDB.DocumentClient());

        var params = {
            TableName: this.tableName,
            ProjectionExpression:"id",
            FilterExpression: "contains(joinedList, :userId)",
            ExpressionAttributeValues: {
                ":userId": userId
            }
        };

        return docClient.scanAsync(params)
            .then(data => { 
                return data.Items; 
            });
        };
}

module.exports = IdeaRepository;