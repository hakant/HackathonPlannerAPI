"use strict";

import * as Bluebird from 'bluebird';
import * as AWS from 'aws-sdk';
import * as nconf from 'nconf';

class DatabaseSetup {

    async SetupNoSqlTables(ideasTableName: string): Promise<any> {
        var config = nconf.get("DynamoDb");
        AWS.config.update(<any>{
            region: config.Region,
            endpoint: config.Endpoint,
            accessKeyId: "testId",
            secretAccessKey: "testKey"
        });

        config.IdeasTableName = ideasTableName;
        nconf.set("DynamoDb", config);

        var dynamodb = Bluebird.promisifyAll(new AWS.DynamoDB()) as AWS.DynamoDBAsync;

        try {
            let result = await dynamodb.describeTableAsync({ TableName: ideasTableName });
            console.info(`Table ${ideasTableName} exists.`);
        } catch (err) {
            console.info(`Table ${ideasTableName} doesn't exist and will be created.`);

            var params = {
                TableName: ideasTableName,
                KeySchema: [
                    { AttributeName: "id", KeyType: "HASH" }   //Partition key
                ],
                AttributeDefinitions: [
                    { AttributeName: "id", AttributeType: "S" },
                ],
                ProvisionedThroughput: {
                    ReadCapacityUnits: 10,
                    WriteCapacityUnits: 10
                }
            };

            try {
                let result = await dynamodb.createTableAsync(params);
                console.info(`Created table ${ideasTableName}`);
            } catch (err) {
                console.error(`Unable to create table ${ideasTableName}. Error:`
                    , JSON.stringify(err, null, 2));
            }
        }
    }

    async BringDownNoSqlTables(ideasTableName: string) {
        var config = nconf.get("DynamoDb");
        AWS.config.update(<any>{
            region: config.Region,
            endpoint: config.Endpoint,
            accessKeyId: "testId",
            secretAccessKey: "testKey"
        });

        var dynamodb = Bluebird.promisifyAll(new AWS.DynamoDB()) as AWS.DynamoDBAsync;

        try {
            let result = await dynamodb.deleteTableAsync({ TableName: ideasTableName });
            console.info(`Removed table ${ideasTableName}`);
        } catch (err) {
            console.error("Unable to remove table. Error:", JSON.stringify(err, null, 2));
        };
    }
}

export default new DatabaseSetup();

