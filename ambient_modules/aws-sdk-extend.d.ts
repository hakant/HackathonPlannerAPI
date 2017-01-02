import * as AWS from 'aws-sdk';

declare module 'aws-sdk' {
    export interface ClientConfigPartial extends Services {
        endpoint?: string;
    }

    export interface DynamoDBAsync {
        describeTableAsync(params: any): Promise<any>;
        createTableAsync(params: any): Promise<any>;
        deleteTableAsync(params: any): Promise<any>;
    }

    export module DynamoDB {
        export interface DocumentAsyncClient {
            getAsync(params: AWS.DynamoDB.GetParam): Promise<any>;
            putAsync(params: AWS.DynamoDB.PutParam): Promise<any>;
            deleteAsync(params: AWS.DynamoDB.DeleteParam): Promise<any>;
            queryAsync(params: AWS.DynamoDB.QueryParam): Promise<any>;
            scanAsync(params: AWS.DynamoDB.ScanParam): Promise<any>;
            updateAsync(params: AWS.DynamoDB.UpdateParam): Promise<any>;
            createSetAsync(list: any[], options?: { validate?: boolean }): Promise<{ values: any[], type: string }>;
            batchGetAsync(params: any): Promise<any>;
            batchWriteAsync(params: any): Promise<any>;
        }
    }
}