"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
const command_handler_container_1 = require("../application/command-handler-container");
const AWS = require("aws-sdk");
const Bluebird = require("bluebird");
const _ = require("underscore");
const IdeaPrePostProcessor_1 = require("../services/IdeaPrePostProcessor");
const ideaPrePostProcessor = new IdeaPrePostProcessor_1.default();
const tableName = "Ideas";
class GetIdeasHandler {
    HandleAsync(request) {
        return __awaiter(this, void 0, void 0, function* () {
            var docClient = Bluebird.promisifyAll(new AWS.DynamoDB.DocumentClient());
            var params = {
                TableName: tableName
            };
            var data = yield docClient.scanAsync(params);
            var items = [];
            data.Items.forEach(idea => {
                items.push(ideaPrePostProcessor.PostProcess(idea, request.user));
            });
            var sortedItems = _.sortBy(items, (item) => ((-1 * item.likeCount) + (-2 * item.teamCount)));
            var result = new GetIdeasResponse();
            result.ideas = sortedItems;
            return result;
        });
    }
}
class GetIdeasRequest {
}
exports.GetIdeasRequest = GetIdeasRequest;
class GetIdeasResponse {
}
exports.GetIdeasResponse = GetIdeasResponse;
// Register the handler to the request
let handler = new GetIdeasHandler();
command_handler_container_1.default.RegisterAsyncHandler(GetIdeasRequest, handler);
//# sourceMappingURL=GetIdeas.js.map