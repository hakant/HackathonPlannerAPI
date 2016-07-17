"use strict";

const mask = require('json-mask');
const _ = require('underscore');

const Helpers = require('../utilities/helpers');
let helpers = new Helpers();

class IdeaPrePostProcessor {

    constructor() {
        this._ideaSkeleton = "id,user(login,id,avatar_url,name),title,overview,description,liked-list,joined-list";
    }

    PreProcess(object) {
        var sanitizedObject = mask(object, this._ideaSkeleton);
        return helpers.ReplacePropertyValuesOf(sanitizedObject, "", null);      // replace all empty strings with nulls
    }

    PostProcess(object){
        object.liked = _.contains(object["liked-list"], object.user.id);
        object.joined = _.contains(object["joined-list"], object.user.id);
        object["like-count"] = object["liked-list"].length;
        object["team-count"] = object["joined-list"].length;

        return helpers.ReplacePropertyValuesOf(object, null, "");
    }
}

module.exports = IdeaPrePostProcessor;