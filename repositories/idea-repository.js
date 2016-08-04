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

    GetAllIdeas(user) {
        var docClient = Promise.promisifyAll(new AWS.DynamoDB.DocumentClient());

        var params = {
            TableName: this.tableName
        };

        var items = [];
        return docClient.scanAsync(params)
            .then(data => {
                data.Items.forEach(idea => {
                    items.push(
                        ideaPrePostProcessor.PostProcess(idea, user)
                        );
                });

                return items;
            });
    }

    GetIdea(ideaId, user) {
        var docClient = Promise.promisifyAll(new AWS.DynamoDB.DocumentClient());

        var params = {
            TableName: this.tableName,
            Key: {
                id: ideaId
            }
        };

        return docClient.getAsync(params)
            .then(data => {
                return ideaPrePostProcessor.PostProcess(data.Item, user);
            })
    }

    UpsertIdea(idea, user) {
        var docClient = Promise.promisifyAll(new AWS.DynamoDB.DocumentClient());
        idea = ideaPrePostProcessor.PreProcess(idea);

        if (typeof user !== "undefined"){
            // Mark the current user as the owner of the idea
            idea.user = {
                login: user.username,
                id: user.id,
                avatar_url: user._json.avatar_url,
                name: user.displayName
            };
        }

        var params = {
            TableName: tableName,
            Item: idea
        };

        return docClient.putAsync(params)
            .then(data => {
                return data;
            });
    }

    EditTitle(idea, user) {
        var docClient = Promise.promisifyAll(new AWS.DynamoDB.DocumentClient());
        idea = ideaPrePostProcessor.PreProcess(idea);

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

    EditOverview(idea, user) {
        var docClient = Promise.promisifyAll(new AWS.DynamoDB.DocumentClient());
        idea = ideaPrePostProcessor.PreProcess(idea);

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

    EditDescription(idea, user) {
        var docClient = Promise.promisifyAll(new AWS.DynamoDB.DocumentClient());
        idea = ideaPrePostProcessor.PreProcess(idea);

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

    LikeIdea(ideaId, user) {
        return this.GetIdea(ideaId, user)
            .then(idea => {
                var index = _.indexOf(idea.likedList, user.id);
                if (index > -1) {
                    idea.likedList.splice(index, 1);
                } else {
                    idea.likedList.push(user.id);
                }
                return idea;
            }).then(idea => {
                return this.UpsertIdea(idea);
            });
    }

    JoinIdea(ideaId, user) {
        return this.GetIdeasThatUserAlreadyJoined(user)
            .then(ideas => {
                return Promise.all(ideas.map((idea) => {
                    return this.UnJoinIdea(idea.id, user);
                }));
            })
            .then(() => {
                return this.GetIdea(ideaId, user);
            })
            .then(idea => {
                var index = _.indexOf(idea.joinedList, user.id);
                if (index < 0) {
                    idea.joinedList.push(user.id);
                }
                return idea;
            }).then(idea => {
                return this.UpsertIdea(idea);
            });
    }

    UnJoinIdea(ideaId, user) {
        return this.GetIdea(ideaId, user)
            .then(idea => {
                var index = _.indexOf(idea.joinedList, user.id);
                if (index > -1) {
                    idea.joinedList.splice(index, 1);
                }
                return idea;
            }).then(idea => {
                return this.UpsertIdea(idea);
            });
    }

    GetIdeasThatUserAlreadyJoined(user){
        var docClient = Promise.promisifyAll(new AWS.DynamoDB.DocumentClient());

        var params = {
            TableName: this.tableName,
            ProjectionExpression:"id",
            FilterExpression: "contains(joinedList, :userId)",
            ExpressionAttributeValues: {
                ":userId": user.id
            }
        };

        return docClient.scanAsync(params)
            .then(data => { 
                return data.Items; 
            });
        };
}

module.exports = IdeaRepository;