// Base interface for all DynamoDB models
export interface BaseModel {
  createdAt: string; // ISO 8601 timestamp
  updatedAt: string; // ISO 8601 timestamp
  isActive: boolean;
}

// Helper function to get current timestamp
export const getCurrentTimestamp = (): string => new Date().toISOString();

// Helper function to create base model fields
export const createBaseFields = (): Pick<BaseModel, 'createdAt' | 'updatedAt' | 'isActive'> => ({
  createdAt: getCurrentTimestamp(),
  updatedAt: getCurrentTimestamp(),
  isActive: true,
});

// Helper function to update timestamp
export const updateTimestamp = (): Pick<BaseModel, 'updatedAt'> => ({
  updatedAt: getCurrentTimestamp(),
});
