import * as nconf from 'nconf';
nconf.argv().env().file({ file: 'config.json' });

import databaseSetup from "../../infrastructure/DatabaseSetup";
import application from "../../application/application";

import { GetIdeasRequest, GetIdeasResponse } from "../../scenarios/GetIdeas";
import { InsertIdeaRequest, InsertIdeaResponse } from "../../scenarios/InsertIdea";

let tableName;

describe("Insert and Get Ideas Scenarios", function () {
  beforeEach(async () => {
    tableName = `Ideas_${GenerateRandomNumber()}`;
    await databaseSetup.SetupNoSqlTables(tableName);
  });

  afterEach(async () => {
    await databaseSetup.BringDownNoSqlTables(tableName);
  });

  function GenerateRandomNumber(): number {
    return Math.floor((Math.random() * 1000) + 1);
  }

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
    let idea = GenerateIdeaWithId("123", testLoggedOnUser);
    await InsertIdea(testLoggedOnUser, idea);

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
    let idea1 = GenerateIdeaWithId("1", testLoggedOnUser, 10, 3);
    let idea2 = GenerateIdeaWithId("2", testLoggedOnUser, 22, 2);
    let idea3 = GenerateIdeaWithId("3", testLoggedOnUser, 28, 4);
    let idea4 = GenerateIdeaWithId("4", testLoggedOnUser, 6, 1);

    await Promise.all([
      InsertIdea(testLoggedOnUser, idea1),
      InsertIdea(testLoggedOnUser, idea2),
      InsertIdea(testLoggedOnUser, idea3),
      InsertIdea(testLoggedOnUser, idea4)
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
    let idea1 = GenerateIdeaWithId("1", testLoggedOnUser, 10, 3, null, true);
    let idea2 = GenerateIdeaWithId("2", testLoggedOnUser, 22, 2, null, true, true);
    let idea3 = GenerateIdeaWithId("3", testLoggedOnUser, 28, 4, null, false, false);
    let idea4 = GenerateIdeaWithId("4", testLoggedOnUser, 6, 1, null, false, false);

    await Promise.all([
      InsertIdea(testLoggedOnUser, idea1),
      InsertIdea(testLoggedOnUser, idea2),
      InsertIdea(testLoggedOnUser, idea3),
      InsertIdea(testLoggedOnUser, idea4)
    ]);

    var request = new GetIdeasRequest();
    request.user = testLoggedOnUser;

    var response = await application.ExecuteAsync<GetIdeasRequest, GetIdeasResponse>(request);
    expect(response.ideas.length).toBe(4);
    expect(response.ideas).toEqual([idea3, idea2, idea1, idea4]);

  });

  // Test Helpers

  async function InsertIdea(user: ILoggedOnUser, idea: IIdea) {
    let insertIdeaRequest = new InsertIdeaRequest();
    insertIdeaRequest.user = user;
    insertIdeaRequest.idea = idea;

    await application.ExecuteAsync<InsertIdeaRequest, InsertIdeaResponse>(insertIdeaRequest);
  }

  function GenerateIdeaWithId(
    id: string,
    loggedOnUser: ILoggedOnUser,
    numberOfLikes?: number,
    numberOfJoins?: number,
    ideaOwner?: IUser,
    loggedOnUserLikedTheIdea?: boolean,
    loggedOnUserJoinedTheIdea?: boolean
  ): IIdea {

    // Generate the owner
    let owner = ideaOwner ? ideaOwner : {
      id: "1",
      login: "hakant",
      name: "Hakan Tuncer",
      avatar_url: "AvatarURL"
    };

    // Generate the likedList
    let likedList = GenerateLikeList(numberOfLikes);
    let joinedList = GenerateJoinList(numberOfJoins);

    if (loggedOnUserLikedTheIdea) {
      likedList.pop();
      likedList.push({
          id: loggedOnUser.id,
          login: loggedOnUser.username
        });
    }
    if (loggedOnUserJoinedTheIdea) {
      joinedList.pop();
      joinedList.push({
          id: loggedOnUser.id,
          login: loggedOnUser.username
        });
    }

    return {
      id: id,
      title: `Idea_Title_${id}`,
      overview: `Idea_Overview_${id}`,
      description: `Idea_Description_${id}`,
      likedList: likedList,
      joinedList: joinedList,
      liked: loggedOnUserLikedTheIdea ? true : false,
      joined: loggedOnUserJoinedTheIdea ? true : false,
      likeCount: likedList.length,
      teamCount: joinedList.length,
      user: owner
    };
  }

  function GenerateLikeList(numberOfLikes?: number) {
    let likedList = [];
    if (numberOfLikes) {
      for (let i = 0; i < numberOfLikes; i++) {
        let id = GenerateRandomNumber();
        likedList.push({
          id: id.toString(),
          login: `user${id}`
        });
      }
    } else {
      likedList = [
        {
          id: "2",
          login: "user1"
        },
        {
          id: "3",
          login: "user2"
        }
      ]
    }
    return likedList;
  }

  function GenerateJoinList(numberOfJoins?: number) {
    let joinedList = [];
    if (numberOfJoins) {
      for (let i = 0; i < numberOfJoins; i++) {
        let id = GenerateRandomNumber();
        joinedList.push({
          id: id.toString(),
          login: `user${id}`
        });
      }
    } else {
      joinedList = [
        {
          id: "2",
          login: "user2"
        },
        {
          id: "3",
          login: "user3"
        },
        {
          id: "4",
          login: "user4"
        }
      ]
    }
    return joinedList;
  }
});