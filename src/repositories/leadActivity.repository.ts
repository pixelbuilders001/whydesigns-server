import { ILeadActivity } from '../models/leadActivity.model';
import { BaseRepository } from './base.repository';
import { TABLES } from '../config/dynamodb.tables';
import { createBaseFields } from '../models/base.model';

export interface PaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export class LeadActivityRepository extends BaseRepository<ILeadActivity> {
  constructor() {
    super(TABLES.LEAD_ACTIVITIES);
  }

  /**
   * Create a new lead activity
   */
  async create(activityData: Partial<ILeadActivity>): Promise<ILeadActivity> {
    const id = this.generateId();

    const activity: ILeadActivity = {
      id,
      leadId: activityData.leadId || '',
      counselorId: activityData.counselorId || '',
      activityType: activityData.activityType || 'other',
      activityDate: activityData.activityDate || new Date().toISOString(),
      remarks: activityData.remarks,
      nextFollowUpDate: activityData.nextFollowUpDate,
      ...createBaseFields(),
    };

    return await this.putItem(activity);
  }

  /**
   * Find activity by ID
   */
  async findById(id: string): Promise<ILeadActivity | null> {
    return await this.getItem({ id: id });
  }

  /**
   * Find all activities for a specific lead
   */
  async findByLeadId(
    leadId: string,
    options: PaginationOptions = {}
  ): Promise<{ activities: ILeadActivity[]; total: number }> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'activityDate',
      sortOrder = 'desc',
    } = options;

    // Scan for activities with this leadId
    const result = await this.scanItems({
      filterExpression: '#leadId = :leadId AND #isActive = :isActive',
      expressionAttributeNames: { '#leadId': 'leadId', '#isActive': 'isActive' },
      expressionAttributeValues: { ':leadId': leadId, ':isActive': true },
    });

    // Sort in memory
    const sortedActivities = this.sortItems(result.items, sortBy, sortOrder);

    // Paginate in memory
    const skip = (page - 1) * limit;
    const paginatedActivities = sortedActivities.slice(skip, skip + limit);

    return {
      activities: paginatedActivities,
      total: sortedActivities.length
    };
  }

  /**
   * Find all activities by counselor
   */
  async findByCounselorId(
    counselorId: string,
    options: PaginationOptions = {}
  ): Promise<{ activities: ILeadActivity[]; total: number }> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'activityDate',
      sortOrder = 'desc',
    } = options;

    // Scan for activities with this counselorId
    const result = await this.scanItems({
      filterExpression: '#counselorId = :counselorId AND #isActive = :isActive',
      expressionAttributeNames: { '#counselorId': 'counselorId', '#isActive': 'isActive' },
      expressionAttributeValues: { ':counselorId': counselorId, ':isActive': true },
    });

    // Sort in memory
    const sortedActivities = this.sortItems(result.items, sortBy, sortOrder);

    // Paginate in memory
    const skip = (page - 1) * limit;
    const paginatedActivities = sortedActivities.slice(skip, skip + limit);

    return {
      activities: paginatedActivities,
      total: sortedActivities.length
    };
  }

  /**
   * Update activity by ID
   */
  async update(id: string, updateData: Partial<ILeadActivity>): Promise<ILeadActivity | null> {
    return await this.updateItem({ id: id }, updateData);
  }

  /**
   * Soft delete activity
   */
  async softDelete(id: string): Promise<ILeadActivity | null> {
    return await this.softDeleteItem({ id: id });
  }

  /**
   * Hard delete activity
   */
  async delete(id: string): Promise<void> {
    await this.hardDeleteItem({ id: id });
  }

  /**
   * Get activity statistics for a lead
   */
  async getLeadActivityStats(leadId: string): Promise<any> {
    const result = await this.scanItems({
      filterExpression: '#leadId = :leadId AND #isActive = :isActive',
      expressionAttributeNames: { '#leadId': 'leadId', '#isActive': 'isActive' },
      expressionAttributeValues: { ':leadId': leadId, ':isActive': true },
    });

    // Group by activity type in memory
    const byType = result.items.reduce((acc: any, activity) => {
      const type = activity.activityType;
      if (!acc[type]) {
        acc[type] = {
          id: type,
          count: 0,
          lastActivity: activity.activityDate,
        };
      }
      acc[type].count++;
      if (activity.activityDate > acc[type].lastActivity) {
        acc[type].lastActivity = activity.activityDate;
      }
      return acc;
    }, {});

    return {
      total: result.items.length,
      byType: Object.values(byType),
    };
  }

  /**
   * Get recent activities across all leads
   */
  async getRecentActivities(limit: number = 10): Promise<ILeadActivity[]> {
    const result = await this.scanItems({
      filterExpression: '#isActive = :isActive',
      expressionAttributeNames: { '#isActive': 'isActive' },
      expressionAttributeValues: { ':isActive': true },
    });

    // Sort by activityDate descending and limit
    const sortedActivities = this.sortItems(result.items, 'activityDate', 'desc');
    return sortedActivities.slice(0, limit);
  }

  /**
   * Helper method to sort items in memory
   */
  private sortItems(items: ILeadActivity[], sortBy: string, sortOrder: string): ILeadActivity[] {
    return items.sort((a, b) => {
      const aVal = (a as any)[sortBy];
      const bVal = (b as any)[sortBy];

      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }
}

export default new LeadActivityRepository();
