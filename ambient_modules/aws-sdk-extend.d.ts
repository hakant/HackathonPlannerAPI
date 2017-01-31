import * as AWS from 'aws-sdk';

declare module 'aws-sdk' {

    export interface DynamoDBAsync {
        describeTableAsync(params: any): Promise<any>;
        createTableAsync(params: any): Promise<any>;
        deleteTableAsync(params: any): Promise<any>;
    }

    export interface DocumentAsyncClient {
        getAsync(params: AWS.DynamoDB.DocumentClient.GetItemInput): Promise<any>;
        putAsync(params: AWS.DynamoDB.DocumentClient.PutItemInput): Promise<any>;
        deleteAsync(params: AWS.DynamoDB.DocumentClient.DeleteItemInput): Promise<any>;
        queryAsync(params: AWS.DynamoDB.DocumentClient.QueryInput): Promise<any>;
        scanAsync(params: AWS.DynamoDB.DocumentClient.ScanInput): Promise<any>;
        updateAsync(params: AWS.DynamoDB.DocumentClient.UpdateItemInput): Promise<any>;
        createSetAsync(list: any[], options?: { validate?: boolean }): Promise<{ values: any[], type: string }>;
        batchGetAsync(params: any): Promise<any>;
        batchWriteAsync(params: any): Promise<any>;
    }
}