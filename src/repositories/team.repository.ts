import { ITeam } from '../models/team.model';
import { BaseRepository } from './base.repository';
import { TABLES } from '../config/dynamodb.tables';
import { createBaseFields } from '../models/base.model';

export interface TeamFilters {
  isPublished?: boolean;
  isActive?: boolean;
  search?: string;
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export class TeamRepository extends BaseRepository<ITeam> {
  constructor() {
    super(TABLES.TEAM);
  }

  /**
   * Create a new team member
   */
  async create(teamData: Partial<ITeam>): Promise<ITeam> {
    const _id = this.generateId();

    const team: ITeam = {
      _id,
      name: teamData.name || '',
      designation: teamData.designation || '',
      description: teamData.description,
      image: teamData.image,
      isPublished: teamData.isPublished || false,
      publishedAt: teamData.publishedAt || null,
      displayOrder: teamData.displayOrder || 0,
      ...createBaseFields(),
    };

    return await this.putItem(team);
  }

  /**
   * Find all team members with filters and pagination
   */
  async findAll(
    filters: TeamFilters = {},
    options: PaginationOptions = {}
  ): Promise<{ teams: ITeam[]; total: number; page: number; totalPages: number }> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'displayOrder',
      sortOrder = 'asc',
    } = options;

    // Build filter expression
    const filterExpressions: string[] = [];
    const expressionAttributeNames: Record<string, string> = {};
    const expressionAttributeValues: Record<string, any> = {};

    if (filters.isPublished !== undefined) {
      filterExpressions.push('#isPublished = :isPublished');
      expressionAttributeNames['#isPublished'] = 'isPublished';
      expressionAttributeValues[':isPublished'] = filters.isPublished;
    }

    if (filters.isActive !== undefined) {
      filterExpressions.push('#isActive = :isActive');
      expressionAttributeNames['#isActive'] = 'isActive';
      expressionAttributeValues[':isActive'] = filters.isActive;
    }

    // Scan with filters
    const result = await this.scanItems({
      filterExpression: filterExpressions.length > 0 ? filterExpressions.join(' AND ') : undefined,
      expressionAttributeNames: Object.keys(expressionAttributeNames).length > 0 ? expressionAttributeNames : undefined,
      expressionAttributeValues: Object.keys(expressionAttributeValues).length > 0 ? expressionAttributeValues : undefined,
    });

    let teams = result.items;

    // Apply search filter in memory
    if (filters.search) {
      const queryLower = filters.search.toLowerCase();
      teams = teams.filter(team =>
        team.name?.toLowerCase().includes(queryLower) ||
        team.designation?.toLowerCase().includes(queryLower) ||
        team.description?.toLowerCase().includes(queryLower)
      );
    }

    // Sort in memory
    const sortedTeams = this.sortItems(teams, sortBy, sortOrder);

    // Paginate
    const skip = (page - 1) * limit;
    const paginatedTeams = sortedTeams.slice(skip, skip + limit);

    return {
      teams: paginatedTeams,
      total: sortedTeams.length,
      page,
      totalPages: Math.ceil(sortedTeams.length / limit),
    };
  }

  /**
   * Find team member by ID
   */
  async findById(id: string): Promise<ITeam | null> {
    return await this.getItem({ _id: id });
  }

  /**
   * Update team member
   */
  async update(id: string, updateData: Partial<ITeam>): Promise<ITeam | null> {
    return await this.updateItem({ _id: id }, updateData);
  }

  /**
   * Delete team member (hard delete)
   */
  async delete(id: string): Promise<ITeam | null> {
    const team = await this.findById(id);
    await this.hardDeleteItem({ _id: id });
    return team;
  }

  /**
   * Soft delete team member
   */
  async softDelete(id: string): Promise<ITeam | null> {
    return await this.softDeleteItem({ _id: id });
  }

  /**
   * Publish team member
   */
  async publish(id: string): Promise<ITeam | null> {
    return await this.updateItem(
      { _id: id },
      {
        isPublished: true,
        publishedAt: new Date().toISOString(),
      }
    );
  }

  /**
   * Unpublish team member
   */
  async unpublish(id: string): Promise<ITeam | null> {
    return await this.updateItem(
      { _id: id },
      { isPublished: false }
    );
  }

  /**
   * Get published team members
   */
  async findPublished(
    options: PaginationOptions = {}
  ): Promise<{ teams: ITeam[]; total: number; page: number; totalPages: number }> {
    return await this.findAll({ isPublished: true, isActive: true }, options);
  }

  /**
   * Get team statistics
   */
  async getStats(): Promise<any> {
    const result = await this.scanItems({});

    const total = result.items.length;
    const published = result.items.filter(t => t.isPublished).length;
    const unpublished = result.items.filter(t => !t.isPublished).length;
    const active = result.items.filter(t => t.isActive).length;
    const inactive = result.items.filter(t => !t.isActive).length;

    return {
      total,
      published,
      unpublished,
      active,
      inactive,
    };
  }

  /**
   * Helper method to sort items in memory
   */
  private sortItems(items: ITeam[], sortBy: string, sortOrder: string): ITeam[] {
    return items.sort((a, b) => {
      const aVal = (a as any)[sortBy];
      const bVal = (b as any)[sortBy];

      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }
}

export default new TeamRepository();
