"use strict";

const AWS = require("aws-sdk");
const Promise = require('bluebird');
const _ = require('underscore');

const IdeaPrePostProcessor = require('../services/idea-pre-post-processor');
const ideaPrePostProcessor = new IdeaPrePostProcessor();

const adminRepository = require('./admin-repository');

const tableName = "Ideas";

class IdeaRepository {

    constructor() {
        this.ideaPrePostProcessor = ideaPrePostProcessor;
        this.adminRepository = adminRepository;
        this.tableName = tableName;
    }

    CanModifyIdea(idea, user) {
        var me = this;
        return new Promise(function (resolve, reject) {
            if (me.adminRepository.IsUserAdmin(user.username)) {
                resolve(true);
            } else {
                resolve(me.IsUserOwnerOfIdea(idea, user));
            }
        });
    }

    IsUserOwnerOfIdea(idea, user) {
        return new Promise((resolve, reject) => {
            if (typeof idea.user === "undefined") {
                return this.GetIdea(idea.id, user)
                    .then((idea) => {
                        resolve(idea.user.id === user.id);
                    });
            } else {
                resolve(idea.user.id === user.id);
            }
        });
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

                return _.sortBy(items, (item) => ((-1 * item.likeCount) - (-2 * item.teamCount)));
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

    InsertIdea(idea, user) {
        var docClient = Promise.promisifyAll(new AWS.DynamoDB.DocumentClient());
        idea = ideaPrePostProcessor.PreProcess(idea);

        if (!this.adminRepository.IsUserAdmin(user.username)) {
            // Enforce the current user as the owner of the idea
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

        return docClient.putAsync(params).then(data => { return data; });
    }

    UpsertIdea(idea, user) {
        var docClient = Promise.promisifyAll(new AWS.DynamoDB.DocumentClient());
        idea = ideaPrePostProcessor.PreProcess(idea);

        var params = {
            TableName: tableName,
            Item: idea
        };

        return docClient.putAsync(params)
            .then(data => { return data; });
    }

    EditTitle(idea, user) {
        var docClient = Promise.promisifyAll(new AWS.DynamoDB.DocumentClient());
        idea = ideaPrePostProcessor.PreProcess(idea);

        return this.CanModifyIdea(idea, user)
            .then(canModify => {
                if (!canModify) {
                    return Promise.reject({ message: "Action is not authorized." })
                }

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
            })
            .then(data => { return data; });
    }

    EditOverview(idea, user) {
        var docClient = Promise.promisifyAll(new AWS.DynamoDB.DocumentClient());
        idea = ideaPrePostProcessor.PreProcess(idea);

        return this.CanModifyIdea(idea, user)
            .then(canModify => {
                if (!canModify) {
                    return Promise.reject({ message: "Action is not authorized." })
                }

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

                return docClient.updateAsync(params);
            })
            .then(data => { return data; });
    }

    EditDescription(idea, user) {
        var docClient = Promise.promisifyAll(new AWS.DynamoDB.DocumentClient());
        idea = ideaPrePostProcessor.PreProcess(idea);

        return this.CanModifyIdea(idea, user)
            .then(canModify => {
                if (!canModify) {
                    return Promise.reject({ message: "Action is not authorized." })
                }

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

                return docClient.updateAsync(params);
            })
            .then(data => { return data; });
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
                return this.UpsertIdea(idea, user);
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
                return this.UpsertIdea(idea, user);
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
                return this.UpsertIdea(idea, user);
            });
    }

    GetIdeasThatUserAlreadyJoined(user) {
        var docClient = Promise.promisifyAll(new AWS.DynamoDB.DocumentClient());

        var params = {
            TableName: this.tableName,
            ProjectionExpression: "id",
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
