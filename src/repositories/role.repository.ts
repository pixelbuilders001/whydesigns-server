import { IRole, CreateRoleInput, UpdateRoleInput } from '../models/role.model';
import { BaseRepository } from './base.repository';
import { TABLES } from '../config/dynamodb.tables';
import { createBaseFields } from '../models/base.model';

export class RoleRepository extends BaseRepository<IRole> {
  constructor() {
    super(TABLES.ROLES);
  }

  /**
   * Create a new role
   */
  async create(roleData: CreateRoleInput): Promise<IRole> {
    const id = this.generateId();

    const role: IRole = {
      id,
      ...roleData,
      permissions: roleData.permissions || [],
      ...createBaseFields(),
    };

    return await this.putItem(role);
  }

  /**
   * Find role by ID
   */
  async findById(id: string): Promise<IRole | null> {
    return await this.getItem({ id: id });
  }

  /**
   * Find role by name using Scan (no GSI needed)
   */
  async findByName(name: string): Promise<IRole | null> {
    const result = await this.scanItems({
      filterExpression: '#name = :name AND #isActive = :isActive',
      expressionAttributeNames: { '#name': 'name', '#isActive': 'isActive' },
      expressionAttributeValues: {
        ':name': name.toUpperCase() as 'USER' | 'ADMIN',
        ':isActive': true
      },
    });

    // Return the first active role found (there should only be one per name)
    return result.items[0] || null;
  }

  /**
   * Find all active roles
   */
  async findAll(): Promise<IRole[]> {
    const result = await this.scanItems({
      filterExpression: '#isActive = :isActive',
      expressionAttributeNames: { '#isActive': 'isActive' },
      expressionAttributeValues: { ':isActive': true },
    });

    return result.items;
  }

  /**
   * Update role
   */
  async update(id: string, updateData: UpdateRoleInput): Promise<IRole | null> {
    return await this.updateItem({ id: id }, updateData);
  }

  /**
   * Delete role
   */
  async delete(id: string): Promise<IRole | null> {
    const role = await this.findById(id);
    await this.hardDeleteItem({ id: id });
    return role;
  }

  /**
   * Check if role exists by name
   */
  async exists(name: string): Promise<boolean> {
    const role = await this.findByName(name);
    return role !== null;
  }
}

export default new RoleRepository();
