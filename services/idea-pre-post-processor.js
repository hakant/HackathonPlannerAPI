"use strict";

const mask = require('json-mask');
const _ = require('underscore');

const Helpers = require('../utilities/helpers');
let helpers = new Helpers();

class IdeaPrePostProcessor {

    constructor() {
        this._ideaSkeleton = "id,user(login,id,avatar_url,name),title,overview,description,likedList,joinedList";
    }

    PreProcess(object) {
        var sanitizedObject = mask(object, this._ideaSkeleton);
        return helpers.ReplacePropertyValuesOf(sanitizedObject, "", null);      // replace all empty strings with nulls
    }

    PostProcess(object, user){
        object.liked = _.some(object.likedList, item => item.id === user.id);
        object.joined = _.some(object.joinedList, item => item.id === user.id);
        object.likeCount = object.likedList.length;
        object.teamCount = object.joinedList.length;

        return helpers.ReplacePropertyValuesOf(object, null, "");
    }
}

module.exports = IdeaPrePostProcessor;