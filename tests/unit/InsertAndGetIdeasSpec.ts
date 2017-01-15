"use strict";

import * as nconf from 'nconf';
nconf.argv().env().file({ file: 'config.json' });

import databaseSetup from "../../infrastructure/DatabaseSetup";
import application from "../../application/application";

import { GetIdeasRequest, GetIdeasResponse } from "../../scenarios/GetIdeas";
import { InsertIdeaRequest, InsertIdeaResponse } from "../../scenarios/InsertIdea";

import testHelpers from "./TestHelpers";

let tableName;

describe("Insert and Get Ideas Scenarios", function () {
  beforeEach(async () => {
    tableName = `Ideas_${testHelpers.GenerateRandomNumber()}`;
    await databaseSetup.SetupNoSqlTables(tableName);
  });

  afterEach(async () => {
    await databaseSetup.BringDownNoSqlTables(tableName);
  });

  it("Initially there are no ideas", async function () {

    var request = new GetIdeasRequest();
    request.user = {
      id: "1",
      username: "hakant",
      displayName: "Hakan Tuncer",
      _json: {
        avatar_url: "AvatarURL"
      }
    };

    var response = await application.ExecuteAsync<GetIdeasRequest, GetIdeasResponse>(request);
    expect(response.ideas.length).toBe(0);

  });

  it("When there is an idea in the system, it's fetched and returned correctly", async function () {

    let testLoggedOnUser: ILoggedOnUser = {
      id: "1",
      username: "hakant",
      displayName: "Hakan Tuncer",
      _json: {
        avatar_url: "AvatarURL"
      }
    };

    // Setup
    let idea = testHelpers.GenerateIdeaWithId("123", testLoggedOnUser);
    await testHelpers.InsertIdea(testLoggedOnUser, idea);

    var request = new GetIdeasRequest();
    request.user = testLoggedOnUser;

    var response = await application.ExecuteAsync<GetIdeasRequest, GetIdeasResponse>(request);
    expect(response.ideas.length).toBe(1);
    expect(response.ideas[0]).toEqual(idea);

  });

  it("When there are multiple ideas in the system, they're fetched and returned in correct order", async function () {

    let testLoggedOnUser: ILoggedOnUser = {
      id: "1",
      username: "hakant",
      displayName: "Hakan Tuncer",
      _json: {
        avatar_url: "AvatarURL"
      }
    };

    // Setup
    let idea1 = testHelpers.GenerateIdeaWithId("1", testLoggedOnUser, 10, 3);
    let idea2 = testHelpers.GenerateIdeaWithId("2", testLoggedOnUser, 22, 2);
    let idea3 = testHelpers.GenerateIdeaWithId("3", testLoggedOnUser, 28, 4);
    let idea4 = testHelpers.GenerateIdeaWithId("4", testLoggedOnUser, 6, 1);

    await Promise.all([
      testHelpers.InsertIdea(testLoggedOnUser, idea1),
      testHelpers.InsertIdea(testLoggedOnUser, idea2),
      testHelpers.InsertIdea(testLoggedOnUser, idea3),
      testHelpers.InsertIdea(testLoggedOnUser, idea4)
    ]);

    var request = new GetIdeasRequest();
    request.user = testLoggedOnUser;

    var response = await application.ExecuteAsync<GetIdeasRequest, GetIdeasResponse>(request);
    expect(response.ideas.length).toBe(4);
    expect(response.ideas).toEqual([idea3, idea2, idea1, idea4]);

  });

  it("Logged on user's like and join status is correctly maintained", async function () {

    let testLoggedOnUser: ILoggedOnUser = {
      id: "1",
      username: "hakant",
      displayName: "Hakan Tuncer",
      _json: {
        avatar_url: "AvatarURL"
      }
    };

    // Setup
    let idea1 = testHelpers.GenerateIdeaWithId("1", testLoggedOnUser, 10, 3, null, true);
    let idea2 = testHelpers.GenerateIdeaWithId("2", testLoggedOnUser, 22, 2, null, true, true);
    let idea3 = testHelpers.GenerateIdeaWithId("3", testLoggedOnUser, 28, 4, null, false, false);
    let idea4 = testHelpers.GenerateIdeaWithId("4", testLoggedOnUser, 6, 1, null, false, false);

    await Promise.all([
      testHelpers.InsertIdea(testLoggedOnUser, idea1),
      testHelpers.InsertIdea(testLoggedOnUser, idea2),
      testHelpers.InsertIdea(testLoggedOnUser, idea3),
      testHelpers.InsertIdea(testLoggedOnUser, idea4)
    ]);

    var request = new GetIdeasRequest();
    request.user = testLoggedOnUser;

    var response = await application.ExecuteAsync<GetIdeasRequest, GetIdeasResponse>(request);
    expect(response.ideas.length).toBe(4);
    expect(response.ideas).toEqual([idea3, idea2, idea1, idea4]);

  });
});