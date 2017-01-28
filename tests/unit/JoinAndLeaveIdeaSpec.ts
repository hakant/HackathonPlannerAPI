"use strict";

import * as nconf from 'nconf';
nconf.argv().env().file({ file: 'config.json' });

import databaseSetup from "../../infrastructure/DatabaseSetup";
import application from "../../application/application";

import { GetIdeasRequest, GetIdeasResponse } from "../../scenarios/GetIdeas";
import { JoinIdeaRequest, JoinIdeaResponse } from "../../scenarios/JoinIdea";
import { LeaveIdeaRequest, LeaveIdeaResponse } from "../../scenarios/LeaveIdea";

import testHelpers from "./TestHelpers";

let tableName;

describe("Join Idea Scenario", function () {
    beforeEach(async (done) => {
        tableName = `Ideas_${testHelpers.GenerateRandomNumber()}`;
        await databaseSetup.SetupNoSqlTables(tableName);
        done();
    });

    afterEach(async (done) => {
        await databaseSetup.BringDownNoSqlTables(tableName);
        done();
    });

    it("Joining an idea adds the user to the list of joined profiles", async function (done) {

        // Setup
        let testLoggedOnUser: ILoggedOnUser = {
            id: "123",
            username: "jack",
            displayName: "Jack Nicholson",
            _json: {
                avatar_url: "AvatarURL"
            }
        };

        let idea = testHelpers.GenerateIdeaWithId("123", testLoggedOnUser, 0, 0,
            {
                id: "123",
                login: "jack",
                name: "Jack Nicholson",
                avatar_url: "AvatarURL"
            }
        );

        await testHelpers.InsertIdea(testLoggedOnUser, idea);

        // Act
        testLoggedOnUser = {
            id: "8782",
            username: "user",
            displayName: "Name Surname",
            _json: {
                avatar_url: "AvatarURL"
            }
        };

        let joinRequest = new JoinIdeaRequest();
        joinRequest.ideaId = idea.id;
        joinRequest.user = testLoggedOnUser;

        await application.ExecuteAsync<JoinIdeaRequest, JoinIdeaResponse>(joinRequest);

        // Assert
        let request = new GetIdeasRequest();
        request.user = testLoggedOnUser;

        let response = await application.ExecuteAsync<GetIdeasRequest, GetIdeasResponse>(request);
        expect(response.ideas.length).toBe(1);

        let ideaInDatabase = response.ideas[0];
        expect(ideaInDatabase.joined).toEqual(true);
        expect(ideaInDatabase.joinedList.length).toBe(1);
        expect(ideaInDatabase.joinedList[0]).toEqual({
            name: 'Name Surname',
            login: "user",
            id: "8782"
        });

        // Act - This time leave the project

        testLoggedOnUser = {
            id: "8782",
            username: "user",
            displayName: "Name Surname",
            _json: {
                avatar_url: "AvatarURL"
            }
        };

        let leaveRequest = new LeaveIdeaRequest();
        leaveRequest.ideaId = idea.id;
        leaveRequest.user = testLoggedOnUser;

        await application.ExecuteAsync<LeaveIdeaRequest, LeaveIdeaResponse>(leaveRequest);

        // Assert
        request = new GetIdeasRequest();
        request.user = testLoggedOnUser;

        response = await application.ExecuteAsync<GetIdeasRequest, GetIdeasResponse>(request);
        expect(response.ideas.length).toBe(1);

        ideaInDatabase = response.ideas[0];
        expect(ideaInDatabase.joined).toEqual(false);
        expect(ideaInDatabase.joinedList.length).toBe(0);

        done();
    });

    it("Joining and leaving ideas by multiple users is correctly handled", async function (done) {

        // Setup
        let testLoggedOnUser: ILoggedOnUser = {
            id: "123",
            username: "jack",
            displayName: "Jack Nicholson",
            _json: {
                avatar_url: "AvatarURL"
            }
        };

        let idea = testHelpers.GenerateIdeaWithId("123", testLoggedOnUser, 0, 0,
            {
                id: "123",
                login: "jack",
                name: "Jack Nicholson",
                avatar_url: "AvatarURL"
            }
        );

        await testHelpers.InsertIdea(testLoggedOnUser, idea);

        testLoggedOnUser = {
            id: "8782",
            username: "user",
            displayName: "Name Surname",
            _json: {
                avatar_url: "AvatarURL"
            }
        };

        let spareIdea = testHelpers.GenerateIdeaWithId("124", testLoggedOnUser, 0, 0,
            {
                id: "8782",
                login: "user ",
                name: "Name Surname",
                avatar_url: "AvatarURL"
            }
        );

        await testHelpers.InsertIdea(testLoggedOnUser, spareIdea);

        // Act
        testLoggedOnUser = {
            id: "334",
            username: "john",
            displayName: "John Williams",
            _json: {
                avatar_url: "AvatarURL"
            }
        };

        let joinRequest = new JoinIdeaRequest();
        joinRequest.ideaId = idea.id;
        joinRequest.user = testLoggedOnUser;

        await application.ExecuteAsync<JoinIdeaRequest, JoinIdeaResponse>(joinRequest);

        // Assert that this single user is in the like list and ONLY for the correct idea entity
        let request = new GetIdeasRequest();
        request.user = testLoggedOnUser;

        let response = await application.ExecuteAsync<GetIdeasRequest, GetIdeasResponse>(request);
        expect(response.ideas.length).toBe(2);

        let ideaInDatabase = response.ideas[0];
        expect(ideaInDatabase.joined).toEqual(true);
        expect(ideaInDatabase.joinedList.length).toBe(1);
        expect(ideaInDatabase.joinedList[0]).toEqual({
            name: 'John Williams',
            login: "john",
            id: "334"
        });

        let otherIdea = response.ideas[1];
        expect(otherIdea.joined).toEqual(false);
        expect(otherIdea.joinedList.length).toBe(0);

        // Act - This time send a join request from someone else

        testLoggedOnUser = {
            id: "335",
            username: "hans",
            displayName: "Hans Zimmer",
            _json: {
                avatar_url: "AvatarURL"
            }
        };

        joinRequest = new JoinIdeaRequest();
        joinRequest.ideaId = idea.id;
        joinRequest.user = testLoggedOnUser;

        await application.ExecuteAsync<JoinIdeaRequest, JoinIdeaResponse>(joinRequest);

        // Assert
        request = new GetIdeasRequest();
        request.user = testLoggedOnUser;

        response = await application.ExecuteAsync<GetIdeasRequest, GetIdeasResponse>(request);
        expect(response.ideas.length).toBe(2);

        ideaInDatabase = response.ideas[0];
        expect(ideaInDatabase.joined).toEqual(true);
        expect(ideaInDatabase.joinedList.length).toBe(2);
        expect(ideaInDatabase.joinedList[0]).toEqual({
            name: 'John Williams',
            login: "john",
            id: "334"
        });
        expect(ideaInDatabase.joinedList[1]).toEqual({
            name: 'Hans Zimmer',
            login: "hans",
            id: "335"
        });

        // Act - Leave the idea from one of the users - check that it is handled correctly
        testLoggedOnUser = {
            id: "335",
            username: "hans",
            displayName: "Hans Zimmer",
            _json: {
                avatar_url: "AvatarURL"
            }
        };

        let leaveRequest = new LeaveIdeaRequest();
        leaveRequest.ideaId = idea.id;
        leaveRequest.user = testLoggedOnUser;

        await application.ExecuteAsync<LeaveIdeaRequest, LeaveIdeaResponse>(leaveRequest);

        // Assert that this single user is in the like list
        request = new GetIdeasRequest();
        request.user = testLoggedOnUser;

        response = await application.ExecuteAsync<GetIdeasRequest, GetIdeasResponse>(request);
        expect(response.ideas.length).toBe(2);

        ideaInDatabase = response.ideas[0];
        expect(ideaInDatabase.joined).toEqual(false);
        expect(ideaInDatabase.joinedList.length).toBe(1);
        expect(ideaInDatabase.joinedList[0]).toEqual({
            name: 'John Williams',
            login: "john",
            id: "334"
        });

        done();
    });

    it("When an idea reaches the maximum team size it rejects further join requests", async function (done) {

        // Setup

        // Set the MaxTeamSize to 5
        let rules = nconf.get("BusinessRules");
        rules.MaxTeamSize = 5;
        nconf.set("BusinessRules", rules);

        let testLoggedOnUser: ILoggedOnUser = {
            id: "123",
            username: "jack",
            displayName: "Jack Nicholson",
            _json: {
                avatar_url: "AvatarURL"
            }
        };

        let idea = testHelpers.GenerateIdeaWithId("123", testLoggedOnUser, 0, 0,
            {
                id: "123",
                login: "jack",
                name: "Jack Nicholson",
                avatar_url: "AvatarURL"
            }
        );

        await testHelpers.InsertIdea(testLoggedOnUser, idea);

        // Act

        let joinRequest = new JoinIdeaRequest();
        joinRequest.ideaId = idea.id;
        joinRequest.user = {
            id: "1",
            username: "user1",
            displayName: "Name Surname",
            _json: {
                avatar_url: "AvatarURL"
            }
        };

        await application.ExecuteAsync<JoinIdeaRequest, JoinIdeaResponse>(joinRequest);

        joinRequest.ideaId = idea.id;
        joinRequest.user = {
            id: "2",
            username: "user2",
            displayName: "Name Surname",
            _json: {
                avatar_url: "AvatarURL"
            }
        };

        await application.ExecuteAsync<JoinIdeaRequest, JoinIdeaResponse>(joinRequest);

        joinRequest.ideaId = idea.id;
        joinRequest.user = {
            id: "3",
            username: "user3",
            displayName: "Name Surname",
            _json: {
                avatar_url: "AvatarURL"
            }
        };

        await application.ExecuteAsync<JoinIdeaRequest, JoinIdeaResponse>(joinRequest);

        joinRequest.ideaId = idea.id;
        joinRequest.user = {
            id: "4",
            username: "user4",
            displayName: "Name Surname",
            _json: {
                avatar_url: "AvatarURL"
            }
        };

        await application.ExecuteAsync<JoinIdeaRequest, JoinIdeaResponse>(joinRequest);

        joinRequest.ideaId = idea.id;
        joinRequest.user = {
            id: "5",
            username: "user5",
            displayName: "Name Surname",
            _json: {
                avatar_url: "AvatarURL"
            }
        };

        await application.ExecuteAsync<JoinIdeaRequest, JoinIdeaResponse>(joinRequest);

        joinRequest.ideaId = idea.id;
        joinRequest.user = {
            id: "5",
            username: "user5",
            displayName: "Name Surname",
            _json: {
                avatar_url: "AvatarURL"
            }
        };

        try {
            await application.ExecuteAsync<JoinIdeaRequest, JoinIdeaResponse>(joinRequest);
        } catch (err) {
            expect(err.message).toBe("This project already has 5 team members. Please select a different project.");
            done();
        }
    });
});