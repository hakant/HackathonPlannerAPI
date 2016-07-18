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

    PostProcess(object){
        object.liked = _.contains(object["likedList"], object.user.id);
        object.joined = _.contains(object["joinedList"], object.user.id);
        object["likeCount"] = object["likedList"].length;
        object["teamCount"] = object["joinedList"].length;

        return helpers.ReplacePropertyValuesOf(object, null, "");
    }
}

module.exports = IdeaPrePostProcessor;