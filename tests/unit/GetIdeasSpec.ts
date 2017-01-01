import * as nconf from 'nconf';

import databaseSetup from "../../infrastructure/DatabaseSetup";
import application from "../../application/application";

import { GetIdeasRequest, GetIdeasResponse } from "../../scenarios/GetIdeas";

let tableName;

describe("GetIdeas Scenario", function () {
  beforeAll(() => {
    nconf.argv().env().file({ file: 'config.json' });
  });

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
        avatar_url: "fakeUrl"
      }
    };

    var response = await application.ExecuteAsync<GetIdeasRequest, GetIdeasResponse>(request);
    expect(response.ideas.length).toBe(0);
    done();
  });
});