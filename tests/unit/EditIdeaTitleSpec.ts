"use strict";

import * as nconf from 'nconf';
nconf.argv().env().file({ file: 'config.json' });

import databaseSetup from "../../infrastructure/DatabaseSetup";
import application from "../../application/application";

import { GetIdeasRequest, GetIdeasResponse } from "../../scenarios/GetIdeas";
import { EditIdeaTitleRequest, EditIdeaTitleResponse } from "../../scenarios/EditIdeaTitle";

import testHelpers from "./TestHelpers";

let tableName;

describe("Edit Idea Title Scenario", function () {
    beforeEach(async () => {
        tableName = `Ideas_${testHelpers.GenerateRandomNumber()}`;
        await databaseSetup.SetupNoSqlTables(tableName);
    });

    afterEach(async () => {
        await databaseSetup.BringDownNoSqlTables(tableName);
    });

    it("When user is authorized, editing an idea's title does update the title correctly", async function () {

        let testLoggedOnUser: ILoggedOnUser = {
            id: "1",
            username: "hakant",
            displayName: "Hakan Tuncer",
            _json: {
                avatar_url: "AvatarURL"
            }
        };

        // Setup
        let idea = testHelpers.GenerateIdeaWithId("123", testLoggedOnUser, 0, 0,
            {
                id: "1",
                login: "hakant",
                name: "Hakan Tuncer",
                avatar_url: "AvatarURL"
            }
        );
        await testHelpers.InsertIdea(testLoggedOnUser, idea);

        // Act
        const updatedTitle = "Updated Title!";
        idea.title = updatedTitle;

        let updateRequest = new EditIdeaTitleRequest();
        updateRequest.idea = idea;
        updateRequest.user = testLoggedOnUser;

        await application.ExecuteAsync<EditIdeaTitleRequest, EditIdeaTitleResponse>(updateRequest);
        
        var request = new GetIdeasRequest();
        request.user = testLoggedOnUser;

        var response = await application.ExecuteAsync<GetIdeasRequest, GetIdeasResponse>(request);
        expect(response.ideas.length).toBe(1);
        expect(response.ideas[0].title).toEqual(updatedTitle);

    });

    // Test these scenarios
    // 1. When user is not admin and not the owner of the idea
    // 2. When user is admin and not the owner of the idea
    // 3. When user is not admin but the owner of the idea

});