import {
  GetCommand,
  PutCommand,
  UpdateCommand,
  DeleteCommand,
  QueryCommand,
  ScanCommand,
  BatchWriteCommand,
} from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';
import database from '../config/database.config';
import { getCurrentTimestamp, updateTimestamp } from '../models/base.model';

export interface QueryOptions {
  indexName?: string;
  filterExpression?: string;
  expressionAttributeNames?: Record<string, string>;
  expressionAttributeValues?: Record<string, any>;
  limit?: number;
  exclusiveStartKey?: Record<string, any>;
  scanIndexForward?: boolean; // true for ascending, false for descending
}

export interface ScanOptions {
  filterExpression?: string;
  expressionAttributeNames?: Record<string, string>;
  expressionAttributeValues?: Record<string, any>;
  limit?: number;
  exclusiveStartKey?: Record<string, any>;
}

/**
 * Base Repository class providing common DynamoDB operations
 */
export abstract class BaseRepository<T> {
  protected tableName: string;
  protected docClient = database.getDocClient();

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  /**
   * Generate a new UUID
   */
  protected generateId(): string {
    return uuidv4();
  }

  /**
   * Get current timestamp in ISO 8601 format
   */
  protected getCurrentTimestamp(): string {
    return getCurrentTimestamp();
  }

  /**
   * Put an item in the table
   */
  protected async putItem(item: T): Promise<T> {
    const command = new PutCommand({
      TableName: this.tableName,
      Item: item as any,
    });

    await this.docClient.send(command);
    return item;
  }

  /**
   * Get an item by key
   */
  protected async getItem(key: Record<string, any>): Promise<T | null> {
    const command = new GetCommand({
      TableName: this.tableName,
      Key: key,
    });

    const result = await this.docClient.send(command);
    return (result.Item as T) || null;
  }

  /**
   * Update an item
   */
  protected async updateItem(
    key: Record<string, any>,
    updateData: Partial<T>
  ): Promise<T | null> {
    // Build update expression
    const updateExpressions: string[] = [];
    const expressionAttributeNames: Record<string, string> = {};
    const expressionAttributeValues: Record<string, any> = {};

    // Add updatedAt timestamp
    const dataWithTimestamp = {
      ...updateData,
      ...updateTimestamp(),
    };

    Object.keys(dataWithTimestamp).forEach((key, index) => {
      const placeholder = `#attr${index}`;
      const valuePlaceholder = `:val${index}`;

      expressionAttributeNames[placeholder] = key;
      expressionAttributeValues[valuePlaceholder] = (dataWithTimestamp as any)[key];
      updateExpressions.push(`${placeholder} = ${valuePlaceholder}`);
    });

    const command = new UpdateCommand({
      TableName: this.tableName,
      Key: key,
      UpdateExpression: `SET ${updateExpressions.join(', ')}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW',
    });

    const result = await this.docClient.send(command);
    return (result.Attributes as T) || null;
  }

  /**
   * Delete an item (soft delete by default)
   */
  protected async softDeleteItem(key: Record<string, any>): Promise<T | null> {
    return await this.updateItem(key, { isActive: false } as any);
  }

  /**
   * Hard delete an item (permanent deletion)
   */
  protected async hardDeleteItem(key: Record<string, any>): Promise<void> {
    const command = new DeleteCommand({
      TableName: this.tableName,
      Key: key,
    });

    await this.docClient.send(command);
  }

  /**
   * Query items with conditions
   */
  protected async queryItems(
    keyConditionExpression: string,
    options: QueryOptions = {}
  ): Promise<{ items: T[]; lastEvaluatedKey?: Record<string, any> }> {
    const command = new QueryCommand({
      TableName: this.tableName,
      KeyConditionExpression: keyConditionExpression,
      IndexName: options.indexName,
      FilterExpression: options.filterExpression,
      ExpressionAttributeNames: options.expressionAttributeNames,
      ExpressionAttributeValues: options.expressionAttributeValues,
      Limit: options.limit,
      ExclusiveStartKey: options.exclusiveStartKey,
      ScanIndexForward: options.scanIndexForward !== undefined ? options.scanIndexForward : true,
    });

    const result = await this.docClient.send(command);

    return {
      items: (result.Items as T[]) || [],
      lastEvaluatedKey: result.LastEvaluatedKey,
    };
  }

  /**
   * Scan all items (use with caution - expensive operation)
   */
  protected async scanItems(
    options: ScanOptions = {}
  ): Promise<{ items: T[]; lastEvaluatedKey?: Record<string, any> }> {
    const command = new ScanCommand({
      TableName: this.tableName,
      FilterExpression: options.filterExpression,
      ExpressionAttributeNames: options.expressionAttributeNames,
      ExpressionAttributeValues: options.expressionAttributeValues,
      Limit: options.limit,
      ExclusiveStartKey: options.exclusiveStartKey,
    });

    const result = await this.docClient.send(command);

    return {
      items: (result.Items as T[]) || [],
      lastEvaluatedKey: result.LastEvaluatedKey,
    };
  }

  /**
   * Batch write items (put or delete up to 25 items)
   */
  protected async batchWriteItems(items: T[], operation: 'put' | 'delete' = 'put'): Promise<void> {
    // DynamoDB batch write supports max 25 items
    const batches: T[][] = [];
    for (let i = 0; i < items.length; i += 25) {
      batches.push(items.slice(i, i + 25));
    }

    for (const batch of batches) {
      const requestItems: any[] = batch.map((item) => {
        if (operation === 'put') {
          return {
            PutRequest: {
              Item: item,
            },
          };
        } else {
          return {
            DeleteRequest: {
              Key: item,
            },
          };
        }
      });

      const command = new BatchWriteCommand({
        RequestItems: {
          [this.tableName]: requestItems,
        },
      });

      await this.docClient.send(command);
    }
  }

  /**
   * Count items with optional filter
   */
  protected async countItems(
    filterExpression?: string,
    expressionAttributeNames?: Record<string, string>,
    expressionAttributeValues?: Record<string, any>
  ): Promise<number> {
    const command = new ScanCommand({
      TableName: this.tableName,
      Select: 'COUNT',
      FilterExpression: filterExpression,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
    });

    const result = await this.docClient.send(command);
    return result.Count || 0;
  }
}
