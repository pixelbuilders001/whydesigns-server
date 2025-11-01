import { IUser, CreateUserInput, UpdateUserInput, UserUtils } from '../models/user.model';
import { BaseRepository } from './base.repository';
import { TABLES } from '../config/dynamodb.tables';
import { PaginationOptions } from '../types';
import { createBaseFields } from '../models/base.model';

export class UserRepository extends BaseRepository<IUser> {
  constructor() {
    super(TABLES.USERS);
  }

  /**
   * Create a new user
   */
  async create(userData: CreateUserInput): Promise<IUser> {
    const _id = this.generateId();

    // Hash password if provided
    const hashedPassword = userData.password
      ? await UserUtils.hashPassword(userData.password)
      : '';

    const user: IUser = {
      _id,
      ...userData,
      password: hashedPassword,
      isEmailVerified: userData.isEmailVerified || false,
      isPhoneVerified: userData.isPhoneVerified || false,
      provider: userData.provider || 'local',
      refreshToken: null,
      ...createBaseFields(),
    };

    return await this.putItem(user);
  }

  /**
   * Find user by ID
   */
  async findById(id: string): Promise<IUser | null> {
    const user = await this.getItem({ _id: id });
    if (!user || !user.isActive) {
      return null;
    }
    return user;
  }

  /**
   * Find user by ID with role populated
   */
  async findByIdWithRole(id: string): Promise<IUser | null> {
    const user = await this.findById(id);
    if (!user) {
      return null;
    }

    // Fetch the role data manually (DynamoDB doesn't support populate)
    const roleRepository = require('./role.repository').default;
    const role = await roleRepository.findById(user.roleId);

    if (role) {
      // Attach the role object to the user
      (user as any).role = role;
    }

    return user;
  }

  /**
   * Find user by ID with password included
   */
  async findByIdWithPassword(id: string): Promise<IUser | null> {
    const user = await this.getItem({ _id: id });
    if (!user || !user.isActive) {
      return null;
    }
    return user; // Password is included by default in DynamoDB
  }

  /**
   * Find user by email using Scan (no GSI needed)
   */
  async findByEmail(email: string): Promise<IUser | null> {
    const result = await this.scanItems({
      filterExpression: '#email = :email AND #isActive = :isActive',
      expressionAttributeNames: { '#email': 'email', '#isActive': 'isActive' },
      expressionAttributeValues: { ':email': email, ':isActive': true },
      limit: 1,
    });

    return result.items[0] || null;
  }

  /**
   * Find user by email with password
   */
  async findByEmailWithPassword(email: string): Promise<IUser | null> {
    return await this.findByEmail(email); // Password is included by default
  }

  /**
   * Find user by phone number using Scan (no GSI needed)
   */
  async findByPhone(phoneNumber: string): Promise<IUser | null> {
    const result = await this.scanItems({
      filterExpression: '#phoneNumber = :phoneNumber AND #isActive = :isActive',
      expressionAttributeNames: { '#phoneNumber': 'phoneNumber', '#isActive': 'isActive' },
      expressionAttributeValues: { ':phoneNumber': phoneNumber, ':isActive': true },
      limit: 1,
    });

    return result.items[0] || null;
  }

  /**
   * Find all users with pagination
   */
  async findAll(options: PaginationOptions): Promise<{ users: IUser[]; total: number }> {
    const { page, limit, sortBy, order } = options;

    // Scan for all active users
    const result = await this.scanItems({
      filterExpression: '#isActive = :isActive',
      expressionAttributeNames: { '#isActive': 'isActive' },
      expressionAttributeValues: { ':isActive': true },
    });

    // Sort in memory (DynamoDB scan doesn't support sorting)
    const sortedUsers = this.sortItems(result.items, sortBy, order);

    // Paginate in memory
    const skip = (page - 1) * limit;
    const paginatedUsers = sortedUsers.slice(skip, skip + limit);

    return {
      users: paginatedUsers,
      total: result.items.length,
    };
  }

  /**
   * Update user
   */
  async update(id: string, updateData: UpdateUserInput): Promise<IUser | null> {
    return await this.updateItem({ _id: id }, updateData);
  }

  /**
   * Soft delete user
   */
  async delete(id: string): Promise<IUser | null> {
    return await this.softDeleteItem({ _id: id });
  }

  /**
   * Hard delete user
   */
  async hardDelete(id: string): Promise<IUser | null> {
    const user = await this.findById(id);
    await this.hardDeleteItem({ _id: id });
    return user;
  }

  /**
   * Check if user exists by email
   */
  async existsByEmail(email: string): Promise<boolean> {
    const user = await this.findByEmail(email);
    return user !== null;
  }

  /**
   * Check if user exists by phone
   */
  async existsByPhone(phoneNumber: string): Promise<boolean> {
    const user = await this.findByPhone(phoneNumber);
    return user !== null;
  }

  /**
   * Soft delete user (alias)
   */
  async softDelete(id: string): Promise<IUser | null> {
    return await this.delete(id);
  }

  /**
   * Update refresh token
   */
  async updateRefreshToken(id: string, refreshToken: string | null): Promise<void> {
    await this.updateItem({ _id: id }, { refreshToken });
  }

  /**
   * Get refresh token
   */
  async getRefreshToken(id: string): Promise<string | null> {
    const user = await this.getItem({ _id: id });
    return user?.refreshToken || null;
  }

  /**
   * Find user by refresh token using Scan (no GSI needed)
   */
  async findByRefreshToken(refreshToken: string): Promise<IUser | null> {
    const result = await this.scanItems({
      filterExpression: '#refreshToken = :refreshToken AND #isActive = :isActive',
      expressionAttributeNames: { '#refreshToken': 'refreshToken', '#isActive': 'isActive' },
      expressionAttributeValues: { ':refreshToken': refreshToken, ':isActive': true },
      limit: 1,
    });

    return result.items[0] || null;
  }

  /**
   * Search users by query string
   */
  async search(query: string, options: PaginationOptions): Promise<{ users: IUser[]; total: number }> {
    const { page, limit, sortBy, order } = options;

    // Scan all active users
    const result = await this.scanItems({
      filterExpression: '#isActive = :isActive',
      expressionAttributeNames: { '#isActive': 'isActive' },
      expressionAttributeValues: { ':isActive': true },
    });

    // Filter in memory (DynamoDB doesn't support full-text search like MongoDB)
    const queryLower = query.toLowerCase();
    const filteredUsers = result.items.filter((user) => {
      return (
        user.firstName?.toLowerCase().includes(queryLower) ||
        user.lastName?.toLowerCase().includes(queryLower) ||
        user.email.toLowerCase().includes(queryLower) ||
        user.phoneNumber?.toLowerCase().includes(queryLower)
      );
    });

    // Sort
    const sortedUsers = this.sortItems(filteredUsers, sortBy, order);

    // Paginate
    const skip = (page - 1) * limit;
    const paginatedUsers = sortedUsers.slice(skip, skip + limit);

    return {
      users: paginatedUsers,
      total: filteredUsers.length,
    };
  }

  /**
   * Find users by role with pagination using Scan (no GSI needed)
   */
  async findByRole(roleId: string, options: PaginationOptions): Promise<{ users: IUser[]; total: number }> {
    const { page, limit, sortBy, order } = options;

    // Scan by roleId (no GSI needed)
    const result = await this.scanItems({
      filterExpression: '#roleId = :roleId AND #isActive = :isActive',
      expressionAttributeNames: { '#roleId': 'roleId', '#isActive': 'isActive' },
      expressionAttributeValues: { ':roleId': roleId, ':isActive': true },
    });

    // Sort
    const sortedUsers = this.sortItems(result.items, sortBy, order);

    // Paginate
    const skip = (page - 1) * limit;
    const paginatedUsers = sortedUsers.slice(skip, skip + limit);

    return {
      users: paginatedUsers,
      total: result.items.length,
    };
  }

  /**
   * Find users by provider with pagination using Scan (no GSI needed)
   */
  async findByProvider(provider: string, options: PaginationOptions): Promise<{ users: IUser[]; total: number }> {
    const { page, limit, sortBy, order } = options;

    // Scan by provider (no GSI needed)
    const result = await this.scanItems({
      filterExpression: '#provider = :provider AND #isActive = :isActive',
      expressionAttributeNames: { '#provider': 'provider', '#isActive': 'isActive' },
      expressionAttributeValues: { ':provider': provider, ':isActive': true },
    });

    // Sort
    const sortedUsers = this.sortItems(result.items, sortBy, order);

    // Paginate
    const skip = (page - 1) * limit;
    const paginatedUsers = sortedUsers.slice(skip, skip + limit);

    return {
      users: paginatedUsers,
      total: result.items.length,
    };
  }

  /**
   * Count users by role
   */
  async countByRole(roleId: string): Promise<number> {
    return await this.countItems(
      '#roleId = :roleId AND #isActive = :isActive',
      { '#roleId': 'roleId', '#isActive': 'isActive' },
      { ':roleId': roleId, ':isActive': true }
    );
  }

  /**
   * Count users by provider
   */
  async countByProvider(provider: string): Promise<number> {
    return await this.countItems(
      '#provider = :provider AND #isActive = :isActive',
      { '#provider': 'provider', '#isActive': 'isActive' },
      { ':provider': provider, ':isActive': true }
    );
  }

  /**
   * Count active users
   */
  async countActive(): Promise<number> {
    return await this.countItems(
      '#isActive = :isActive',
      { '#isActive': 'isActive' },
      { ':isActive': true }
    );
  }

  /**
   * Count inactive users
   */
  async countInactive(): Promise<number> {
    return await this.countItems(
      '#isActive = :isActive',
      { '#isActive': 'isActive' },
      { ':isActive': false }
    );
  }

  /**
   * Helper method to sort items in memory
   */
  private sortItems(items: IUser[], sortBy: string, order: string): IUser[] {
    return items.sort((a, b) => {
      const aVal = (a as any)[sortBy];
      const bVal = (b as any)[sortBy];

      if (aVal < bVal) return order === 'asc' ? -1 : 1;
      if (aVal > bVal) return order === 'asc' ? 1 : -1;
      return 0;
    });
  }
}

export default new UserRepository();
