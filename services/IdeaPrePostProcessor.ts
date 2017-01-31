"use strict";

import * as mask from 'json-mask';
import * as _ from 'underscore';

import Helpers from '../utilities/Helpers';
let helpers = new Helpers();

export default class IdeaPrePostProcessor {

    _ideaSkeleton : string;

    constructor() {
        this._ideaSkeleton = "id,user(login,id,avatar_url,name),title,overview,description,likedList,joinedList";
    }

    PreProcess(idea: IIdea | IIdeaEntity): IIdeaEntity {
        var sanitizedObject = mask(idea, this._ideaSkeleton) as IIdeaEntity;
        // replace all empty strings with nulls - dynamodb doesn't like empty strings
        return helpers.ReplacePropertyValuesOf(sanitizedObject, "", null);
    }

    PostProcess(idea: IIdeaEntity, user: ILoggedOnUser) : IIdea {
        var extendedIdea = idea as IIdea;   

        extendedIdea.liked = _.some(idea.likedList, item => item.id === user.id);
        extendedIdea.joined = _.some(idea.joinedList, item => item.id === user.id);
        extendedIdea.likeCount = idea.likedList.length;
        extendedIdea.teamCount = idea.joinedList.length;

        return helpers.ReplacePropertyValuesOf(idea, null, "");
    }
}