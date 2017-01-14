import * as nconf from 'nconf';
nconf.argv().env().file({ file: 'config.json' });

import databaseSetup from "../../infrastructure/DatabaseSetup";
import application from "../../application/application";

import { GetIdeasRequest, GetIdeasResponse } from "../../scenarios/GetIdeas";
import { InsertIdeaRequest, InsertIdeaResponse } from "../../scenarios/InsertIdea";

let tableName;

describe("GetIdeas Scenario", function () {
  beforeEach(async (done) => {
    tableName = `Ideas_${Math.floor((Math.random() * 1000) + 1)}`;
    await databaseSetup.SetupNoSqlTables(tableName);
    done();
  });

  afterEach(async (done) => {
    await databaseSetup.BringDownNoSqlTables(tableName);
    done();
  });

  it("Initially there are no ideas", async function (done) {
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
    done();
  });

  it("When there is an idea in the system, it's fetched and returned correctly", async function (done) {

    let testLoggedOnUser: ILoggedOnUser = {
      id: "1",
      username: "hakant",
      displayName: "Hakan Tuncer",
      _json: {
        avatar_url: "AvatarURL"
      }
    };

    // Setup
    let idea: IIdea = {
      id: "123",
      title: "A Brilliant Idea",
      overview: "Idea Overview",
      description: "Idea Description",
      likedList: [
        {
          id: "2",
          login: "user1"
        },
        {
          id: "3",
          login: "user2"
        }
      ],
      joinedList: [
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
      ],
      liked: false,
      joined: false,
      likeCount: 2,
      teamCount: 3,
      user: {
        id: "1",
        login: "hakant",
        name: "Hakan Tuncer",
        avatar_url: "AvatarURL"
      }
    };

    let insertIdeaRequest = new InsertIdeaRequest();
    insertIdeaRequest.user = testLoggedOnUser;
    insertIdeaRequest.idea = idea;

    await application.ExecuteAsync<InsertIdeaRequest, InsertIdeaResponse>(insertIdeaRequest);

    var request = new GetIdeasRequest();
    request.user = testLoggedOnUser;

    var response = await application.ExecuteAsync<GetIdeasRequest, GetIdeasResponse>(request);
    expect(response.ideas.length).toBe(1);
    expect(response.ideas[0]).toEqual(idea);
    done();
  });
});