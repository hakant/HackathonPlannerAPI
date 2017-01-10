"use strict";

import * as AWS from 'aws-sdk';
import { DynamoDB } from 'aws-sdk'
import * as Bluebird from 'bluebird';
import * as _ from 'underscore';
import * as nconf from 'nconf';

import IdeaPrePostProcessor from '../services/IdeaPrePostProcessor';
const ideaPrePostProcessor = new IdeaPrePostProcessor();

import AdminRepository from './AdminRepository';
const adminRepository = new AdminRepository();

const tableName = nconf.get("DynamoDb").IdeasTableName;

var businessRules = nconf.get("BusinessRules");

export default class IdeaRepository implements IIdeaRepository {

    ideaPrePostProcessor: any;
    adminRepository: IAdminRepository;
    tableName: string;

    constructor() {
        this.ideaPrePostProcessor = ideaPrePostProcessor;
        this.adminRepository = adminRepository;
        this.tableName = tableName;
    }

    CanModifyIdea(idea: IIdeaEntity, user: ILoggedOnUser): Promise<boolean> {
        var me = this;
        return new Promise(function (resolve, reject) {
            if (me.adminRepository.IsUserAdmin(user.username)) {
                resolve(true);
            } else {
                resolve(me.IsUserOwnerOfIdea(idea, user));
            }
        });
    }

    IsUserOwnerOfIdea(idea: IIdeaEntity, user: ILoggedOnUser): Promise<boolean> {
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

    GetAllIdeas(user: ILoggedOnUser): Promise<Array<IIdea>> {
        var docClient = Bluebird.promisifyAll(new AWS.DynamoDB.DocumentClient()) as AWS.DocumentAsyncClient;

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

                return _.sortBy(items, (item) => ((-1 * item.likeCount) + (-2 * item.teamCount)));
            });
    }

    GetIdea(ideaId: string, user: ILoggedOnUser): Promise<IIdea> {
        var docClient = Bluebird.promisifyAll(new AWS.DynamoDB.DocumentClient()) as AWS.DocumentAsyncClient;

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

    InsertIdea(idea: IIdea, user: ILoggedOnUser): Promise<any> {
        var docClient = Bluebird.promisifyAll(new AWS.DynamoDB.DocumentClient()) as AWS.DocumentAsyncClient;
        var ideaEntity = ideaPrePostProcessor.PreProcess(idea);

        if (!this.adminRepository.IsUserAdmin(user.username)) {
            // Enforce the current user as the owner of the idea
            ideaEntity.user = {
                login: user.username,
                id: user.id,
                avatar_url: user._json.avatar_url,
                name: user.displayName
            };
        }

        var params = {
            TableName: tableName,
            Item: ideaEntity
        };

        return docClient.putAsync(params).then(data => { return data; });
    }

    UpsertIdea(idea: IIdea, user: ILoggedOnUser): Promise<any> {
        var docClient = Bluebird.promisifyAll(new AWS.DynamoDB.DocumentClient()) as AWS.DocumentAsyncClient;
        var ideaEntity = ideaPrePostProcessor.PreProcess(idea);

        var params = {
            TableName: tableName,
            Item: ideaEntity
        };

        return docClient.putAsync(params)
            .then(data => { return data; });
    }

    EditTitle(idea: IIdea, user: ILoggedOnUser): Promise<any> {
        var docClient = Bluebird.promisifyAll(new AWS.DynamoDB.DocumentClient()) as AWS.DocumentAsyncClient;
        var ideaEntity = ideaPrePostProcessor.PreProcess(idea);

        return this.CanModifyIdea(ideaEntity, user)
            .then(canModify => {
                if (!canModify) {
                    return Promise.reject({ message: "Action is not authorized." })
                }

                var params = {
                    TableName: tableName,
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

                return docClient.updateAsync(params)
            })
            .then(data => { return data; });
    }

    EditOverview(idea: IIdea, user: ILoggedOnUser): Promise<any> {
        var docClient = Bluebird.promisifyAll(new AWS.DynamoDB.DocumentClient()) as AWS.DocumentAsyncClient;
        var ideaEntity = ideaPrePostProcessor.PreProcess(idea);

        return this.CanModifyIdea(ideaEntity, user)
            .then(canModify => {
                if (!canModify) {
                    return Promise.reject({ message: "Action is not authorized." })
                }

                var params = {
                    TableName: tableName,
                    Key: {
                        id: ideaEntity.id
                    },
                    UpdateExpression: "set overview = :o",
                    ExpressionAttributeValues: {
                        ":o": ideaEntity.overview
                    },
                    ReturnValues: "UPDATED_NEW",
                    AttributeUpdates: undefined
                };

                return docClient.updateAsync(params);
            })
            .then(data => { return data; });
    }

    EditDescription(idea: IIdea, user: ILoggedOnUser): Promise<any> {
        var docClient = Bluebird.promisifyAll(new AWS.DynamoDB.DocumentClient()) as AWS.DocumentAsyncClient;
        var ideaEntity = ideaPrePostProcessor.PreProcess(idea);

        return this.CanModifyIdea(ideaEntity, user)
            .then(canModify => {
                if (!canModify) {
                    return Promise.reject({ message: "Action is not authorized." })
                }

                var params = {
                    TableName: tableName,
                    Key: {
                        id: ideaEntity.id
                    },
                    UpdateExpression: "set description = :d",
                    ExpressionAttributeValues: {
                        ":d": ideaEntity.description
                    },
                    ReturnValues: "UPDATED_NEW",
                    AttributeUpdates: undefined
                };

                return docClient.updateAsync(params);
            })
            .then(data => { return data; });
    }

    LikeIdea(ideaId: string, user: ILoggedOnUser): Promise<any> {
        return this.GetIdea(ideaId, user)
            .then(idea => {
                var index = _.findIndex(idea.likedList, item => item.id === user.id);
                if (index > -1) {
                    idea.likedList.splice(index, 1);
                } else {
                    idea.likedList.push({
                        id: user.id,
                        name: user.displayName,
                        login: user.username
                    });
                }
                return idea;
            }).then(idea => {
                return this.UpsertIdea(idea, user);
            });
    }

    JoinIdea(ideaId: string, user: ILoggedOnUser): Promise<any> {
        let currentIdea: IIdea;
        return this.GetIdea(ideaId, user)
            .then(idea => {
                currentIdea = idea; // save the idea in clojure for later use
                if (idea.joinedList.length >= businessRules.MaxTeamSize) {
                    return Promise.reject(`This project already has ${businessRules.MaxTeamSize} team members. ` +
                        "Please select a different project.");
                }
            })
            .then(() => { return this.GetIdeasThatUserAlreadyJoined(user); })
            .then(ideas => {
                return Promise.all(ideas.map((idea) => {
                    return this.UnJoinIdea(idea.id, user);
                }));
            })
            .then(() => { return currentIdea; })
            .then(idea => {
                var index = _.findIndex(idea.joinedList, item => item.id === user.id);
                if (index < 0) {
                    idea.joinedList.push({
                        id: user.id,
                        name: user.displayName,
                        login: user.username
                    });
                }
                return idea;
            })
            .then(idea => {
                return this.UpsertIdea(idea, user);
            });
    }

    UnJoinIdea(ideaId: string, user: ILoggedOnUser): Promise<any> {
        return this.GetIdea(ideaId, user)
            .then(idea => {
                var index = _.findIndex(idea.joinedList, item => item.id === user.id);
                if (index > -1) {
                    idea.joinedList.splice(index, 1);
                }
                return idea;
            }).then(idea => {
                return this.UpsertIdea(idea, user);
            });
    }

    GetIdeasThatUserAlreadyJoined(user: ILoggedOnUser): Promise<Array<IIdeaEntity>> {
        var docClient = Bluebird.promisifyAll(new AWS.DynamoDB.DocumentClient()) as AWS.DocumentAsyncClient;

        // TODO: Is there a better way of filtering this already in the database?
        var params = {
            TableName: this.tableName,
            ProjectionExpression: "id, joinedList",
        };

        let items: Array<IIdeaEntity> = [];
        return docClient.scanAsync(params)
            .then(data => {
                data.Items.forEach((item: IIdeaEntity) => {
                    if (_.some(item.joinedList, i => i.id === user.id)) {
                        items.push(item);
                    }
                });

                return items;
            });
    };
}