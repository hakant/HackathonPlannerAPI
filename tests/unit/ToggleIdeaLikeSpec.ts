"use strict";

import * as nconf from 'nconf';
nconf.argv().env().file({ file: 'config.json' });

import databaseSetup from "../../infrastructure/DatabaseSetup";
import application from "../../application/application";

import { GetIdeasRequest, GetIdeasResponse } from "../../scenarios/GetIdeas";
import { ToggleIdeaLikeRequest, ToggleIdeaLikeResponse } from "../../scenarios/ToggleIdeaLike";

import testHelpers from "./TestHelpers";

let tableName;

describe("Toggle Idea Like Scenario", function () {
    beforeEach(async (done) => {
        tableName = `Ideas_${testHelpers.GenerateRandomNumber()}`;
        await databaseSetup.SetupNoSqlTables(tableName);
        done();
    });

    afterEach(async (done) => {
        await databaseSetup.BringDownNoSqlTables(tableName);
        done();
    });

    it("Liking an idea toggles the like for that user correctly", async function (done) {

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

        let likeRequest = new ToggleIdeaLikeRequest();
        likeRequest.ideaId = idea.id;
        likeRequest.user = testLoggedOnUser;

        await application.ExecuteAsync<ToggleIdeaLikeRequest, ToggleIdeaLikeResponse>(likeRequest);
        
        // Assert
        let request = new GetIdeasRequest();
        request.user = testLoggedOnUser;

        let response = await application.ExecuteAsync<GetIdeasRequest, GetIdeasResponse>(request);
        expect(response.ideas.length).toBe(1);

        let ideaInDatabase = response.ideas[0];
        expect(ideaInDatabase.liked).toEqual(true);
        expect(ideaInDatabase.likedList.length).toBe(1);
        expect(ideaInDatabase.likedList[0]).toEqual({
            name: 'Name Surname',
            login: "user",
            id: "8782"
        });

        // Act - This time toggle the like back again

        testLoggedOnUser = {
            id: "8782",
            username: "user",
            displayName: "Name Surname",
            _json: {
                avatar_url: "AvatarURL"
            }
        };

        likeRequest = new ToggleIdeaLikeRequest();
        likeRequest.ideaId = idea.id;
        likeRequest.user = testLoggedOnUser;

        await application.ExecuteAsync<ToggleIdeaLikeRequest, ToggleIdeaLikeResponse>(likeRequest);
        
        // Assert
        request = new GetIdeasRequest();
        request.user = testLoggedOnUser;

        response = await application.ExecuteAsync<GetIdeasRequest, GetIdeasResponse>(request);
        expect(response.ideas.length).toBe(1);

        ideaInDatabase = response.ideas[0];
        expect(ideaInDatabase.liked).toEqual(false);
        expect(ideaInDatabase.likedList.length).toBe(0);

        done();
    });

    it("Liking and disliking idea by multiple users is correctly handled", async function (done) {

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

        let likeRequest = new ToggleIdeaLikeRequest();
        likeRequest.ideaId = idea.id;
        likeRequest.user = testLoggedOnUser;

        await application.ExecuteAsync<ToggleIdeaLikeRequest, ToggleIdeaLikeResponse>(likeRequest);
        
        // Assert that this single user is in the like list and ONLY for the correct idea entity
        let request = new GetIdeasRequest();
        request.user = testLoggedOnUser;

        let response = await application.ExecuteAsync<GetIdeasRequest, GetIdeasResponse>(request);
        expect(response.ideas.length).toBe(2);

        let ideaInDatabase = response.ideas[0];
        expect(ideaInDatabase.liked).toEqual(true);
        expect(ideaInDatabase.likedList.length).toBe(1);
        expect(ideaInDatabase.likedList[0]).toEqual({
            name: 'John Williams',
            login: "john",
            id: "334"
        });

        let otherIdea = response.ideas[1];
        expect(otherIdea.liked).toEqual(false);
        expect(otherIdea.likedList.length).toBe(0);

        // Act - This time send a like from someone else

        testLoggedOnUser = {
            id: "335",
            username: "hans",
            displayName: "Hans Zimmer",
            _json: {
                avatar_url: "AvatarURL"
            }
        };

        likeRequest = new ToggleIdeaLikeRequest();
        likeRequest.ideaId = idea.id;
        likeRequest.user = testLoggedOnUser;

        await application.ExecuteAsync<ToggleIdeaLikeRequest, ToggleIdeaLikeResponse>(likeRequest);
        
        // Assert
        request = new GetIdeasRequest();
        request.user = testLoggedOnUser;

        response = await application.ExecuteAsync<GetIdeasRequest, GetIdeasResponse>(request);
        expect(response.ideas.length).toBe(2);

        ideaInDatabase = response.ideas[0];
        expect(ideaInDatabase.liked).toEqual(true);
        expect(ideaInDatabase.likedList.length).toBe(2);
        expect(ideaInDatabase.likedList[0]).toEqual({
            name: 'John Williams',
            login: "john",
            id: "334"
        });
        expect(ideaInDatabase.likedList[1]).toEqual({
            name: 'Hans Zimmer',
            login: "hans",
            id: "335"
        });

        // Act - Unlike the idea from one of the users - check that is handled correctly
        testLoggedOnUser = {
            id: "335",
            username: "hans",
            displayName: "Hans Zimmer",
            _json: {
                avatar_url: "AvatarURL"
            }
        };

        likeRequest = new ToggleIdeaLikeRequest();
        likeRequest.ideaId = idea.id;
        likeRequest.user = testLoggedOnUser;

        await application.ExecuteAsync<ToggleIdeaLikeRequest, ToggleIdeaLikeResponse>(likeRequest);

        // Assert that this single user is in the like list
        request = new GetIdeasRequest();
        request.user = testLoggedOnUser;

        response = await application.ExecuteAsync<GetIdeasRequest, GetIdeasResponse>(request);
        expect(response.ideas.length).toBe(2);

        ideaInDatabase = response.ideas[0];
        expect(ideaInDatabase.liked).toEqual(false);
        expect(ideaInDatabase.likedList.length).toBe(1);
        expect(ideaInDatabase.likedList[0]).toEqual({
            name: 'John Williams',
            login: "john",
            id: "334"
        });

        done();
    });
    
});