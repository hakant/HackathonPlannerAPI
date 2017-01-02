import * as AWS from 'aws-sdk';

declare module 'aws-sdk' {
    export interface ClientConfigPartial {
        endpoint?: string;
    }

    export interface DynamoDBAsync {
        describeTableAsync(params: any): Promise<any>;
        createTableAsync(params: any): Promise<any>;
        deleteTableAsync(params: any): Promise<any>;
    }

    export module DynamoDB {
        export interface DocumentAsyncClient {
            getAsync(params: GetParam): Promise<any>;
            putAsync(params: PutParam): Promise<any>;
            deleteAsync(params: DeleteParam): Promise<any>;
            queryAsync(params: QueryParam): Promise<any>;
            scanAsync(params: ScanParam): Promise<any>;
            updateAsync(params: UpdateParam): Promise<any>;
            createSetAsync(list: any[], options?: { validate?: boolean }): Promise<{ values: any[], type: string }>;
            batchGetAsync(params: any): Promise<any>;
            batchWriteAsync(params: any): Promise<any>;
        }
    }
}