import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { config } from './env.config';

export class Database {
  private static instance: Database;
  private client: DynamoDBClient;
  private docClient: DynamoDBDocumentClient;

  private constructor() {
    // Configure DynamoDB client
    const dynamoConfig: any = {
      region: config.AWS_REGION,
    };

    // Add credentials if provided (for non-AWS environments)
    if (config.AWS_ACCESS_KEY_ID && config.AWS_SECRET_ACCESS_KEY) {
      dynamoConfig.credentials = {
        accessKeyId: config.AWS_ACCESS_KEY_ID,
        secretAccessKey: config.AWS_SECRET_ACCESS_KEY,
      };
    }

    // Add custom endpoint for local development (DynamoDB Local)
    if (config.DYNAMODB_ENDPOINT) {
      dynamoConfig.endpoint = config.DYNAMODB_ENDPOINT;
    }

    this.client = new DynamoDBClient(dynamoConfig);

    // Create DynamoDB Document Client for easier document operations
    this.docClient = DynamoDBDocumentClient.from(this.client, {
      marshallOptions: {
        removeUndefinedValues: true, // Remove undefined values
        convertEmptyValues: false, // Don't convert empty strings to null
        convertClassInstanceToMap: true, // Convert Date objects and other class instances
      },
      unmarshallOptions: {
        wrapNumbers: false, // Return numbers as JavaScript numbers
      },
    });
  }

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  public async connect(): Promise<void> {
    try {
      // Test connection by listing tables (optional)
      console.log('✅ DynamoDB client initialized successfully');
      console.log(`📍 Region: ${config.AWS_REGION}`);
      if (config.DYNAMODB_ENDPOINT) {
        console.log(`🔧 Using custom endpoint: ${config.DYNAMODB_ENDPOINT}`);
      }
    } catch (error) {
      console.error('❌ DynamoDB initialization failed:', error);
      process.exit(1);
    }
  }

  public async disconnect(): Promise<void> {
    try {
      this.client.destroy();
      console.log('DynamoDB connection closed');
    } catch (error) {
      console.error('Error closing DynamoDB connection:', error);
    }
  }

  public getClient(): DynamoDBClient {
    return this.client;
  }

  public getDocClient(): DynamoDBDocumentClient {
    return this.docClient;
  }
}

export default Database.getInstance();
