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

    PreProcess(idea: IIdea): IIdeaEntity {
        var sanitizedObject = mask(idea, this._ideaSkeleton);
        return helpers.ReplacePropertyValuesOf(sanitizedObject, "", null);      // replace all empty strings with nulls
    }

    PostProcess(idea: IIdea, user: ILoggedOnUser) : IIdea {
        idea.liked = _.some(idea.likedList, item => item.id === user.id);
        idea.joined = _.some(idea.joinedList, item => item.id === user.id);
        idea.likeCount = idea.likedList.length;
        idea.teamCount = idea.joinedList.length;

        return helpers.ReplacePropertyValuesOf(idea, null, "");
    }
}