import { ILead } from '../models/lead.model';
import { BaseRepository } from './base.repository';
import { TABLES } from '../config/dynamodb.tables';
import { createBaseFields } from '../models/base.model';

export interface LeadFilters {
  isActive?: boolean;
  contacted?: boolean;
  search?: string;
  areaOfInterest?: string;
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export class LeadRepository extends BaseRepository<ILead> {
  constructor() {
    super(TABLES.LEADS);
  }

  /**
   * Create a new lead
   */
  async create(leadData: Partial<ILead>): Promise<ILead> {
    const id = this.generateId();

    const lead: any = {
      id,
      fullName: leadData.fullName || '',
      email: leadData.email || '',
      phone: leadData.phone || '',
      areaOfInterest: leadData.areaOfInterest || '',
      contacted: leadData.contacted || false,
      ...createBaseFields(),
    };

    // Only add optional fields if they have values
    if (leadData.message) {
      lead.message = leadData.message;
    }

    if (leadData.contactedAt) {
      lead.contactedAt = typeof leadData.contactedAt === 'string'
        ? leadData.contactedAt
        : new Date(leadData.contactedAt).toISOString();
    }

    if (leadData.contactedBy) {
      lead.contactedBy = leadData.contactedBy;
    }

    return await this.putItem(lead);
  }

  /**
   * Find lead by ID
   */
  async findById(id: string): Promise<ILead | null> {
    return await this.getItem({ id: id });
  }

  /**
   * Find all leads with filters and pagination
   */
  async findAll(
    filters: LeadFilters = {},
    options: PaginationOptions = {}
  ): Promise<{ leads: ILead[]; total: number; page: number; totalPages: number }> {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = options;

    // Build filter expression
    const filterExpressions: string[] = [];
    const expressionAttributeNames: Record<string, string> = {};
    const expressionAttributeValues: Record<string, any> = {};

    if (filters.isActive !== undefined) {
      filterExpressions.push('#isActive = :isActive');
      expressionAttributeNames['#isActive'] = 'isActive';
      expressionAttributeValues[':isActive'] = filters.isActive;
    }

    if (filters.contacted !== undefined) {
      filterExpressions.push('#contacted = :contacted');
      expressionAttributeNames['#contacted'] = 'contacted';
      expressionAttributeValues[':contacted'] = filters.contacted;
    }

    if (filters.areaOfInterest) {
      filterExpressions.push('contains(#areaOfInterest, :areaOfInterest)');
      expressionAttributeNames['#areaOfInterest'] = 'areaOfInterest';
      expressionAttributeValues[':areaOfInterest'] = filters.areaOfInterest;
    }

    // Scan with filters
    const result = await this.scanItems({
      filterExpression: filterExpressions.length > 0 ? filterExpressions.join(' AND ') : undefined,
      expressionAttributeNames: Object.keys(expressionAttributeNames).length > 0 ? expressionAttributeNames : undefined,
      expressionAttributeValues: Object.keys(expressionAttributeValues).length > 0 ? expressionAttributeValues : undefined,
    });

    let leads = result.items;

    // Handle search filter in memory (DynamoDB doesn't support full-text search)
    if (filters.search) {
      const queryLower = filters.search.toLowerCase();
      leads = leads.filter((lead) => {
        return (
          lead.fullName?.toLowerCase().includes(queryLower) ||
          lead.email?.toLowerCase().includes(queryLower) ||
          lead.phone?.toLowerCase().includes(queryLower) ||
          lead.areaOfInterest?.toLowerCase().includes(queryLower) ||
          lead.message?.toLowerCase().includes(queryLower)
        );
      });
    }

    // Sort in memory
    const sortedLeads = this.sortItems(leads, sortBy, sortOrder);

    // Paginate in memory
    const skip = (page - 1) * limit;
    const paginatedLeads = sortedLeads.slice(skip, skip + limit);

    return {
      leads: paginatedLeads,
      total: sortedLeads.length,
      page,
      totalPages: Math.ceil(sortedLeads.length / limit),
    };
  }

  /**
   * Update lead
   */
  async update(id: string, updateData: Partial<ILead>): Promise<ILead | null> {
    return await this.updateItem({ id: id }, updateData);
  }

  /**
   * Delete lead (soft delete)
   */
  async softDelete(id: string): Promise<ILead | null> {
    return await this.softDeleteItem({ id: id });
  }

  /**
   * Delete lead (hard delete)
   */
  async delete(id: string): Promise<ILead | null> {
    const lead = await this.findById(id);
    await this.hardDeleteItem({ id: id });
    return lead;
  }

  /**
   * Update isActive status
   */
  async updateActiveStatus(id: string, isActive: boolean): Promise<ILead | null> {
    return await this.updateItem({ id: id }, { isActive });
  }

  /**
   * Check if lead exists by email
   */
  async existsByEmail(email: string): Promise<boolean> {
    const result = await this.scanItems({
      filterExpression: '#email = :email AND #isActive = :isActive',
      expressionAttributeNames: { '#email': 'email', '#isActive': 'isActive' },
      expressionAttributeValues: { ':email': email.toLowerCase(), ':isActive': true },
      limit: 1,
    });

    return result.items.length > 0;
  }

  /**
   * Mark lead as contacted
   */
  async markAsContacted(id: string, userId: string): Promise<ILead | null> {
    return await this.updateItem(
      { id: id },
      {
        contacted: true,
        contactedAt: new Date().toISOString(),
        contactedBy: userId,
      }
    );
  }

  /**
   * Mark lead as not contacted
   */
  async markAsNotContacted(id: string): Promise<ILead | null> {
    // Note: Setting undefined doesn't remove the field in DynamoDB, so we leave it as is
    // The service layer should handle not displaying these fields when contacted is false
    return await this.updateItem(
      { id: id },
      {
        contacted: false,
      }
    );
  }

  /**
   * Get lead statistics
   */
  async getStats(): Promise<any> {
    const allLeads = await this.scanItems({});

    const total = allLeads.items.length;
    const active = allLeads.items.filter((lead) => lead.isActive).length;
    const inactive = allLeads.items.filter((lead) => !lead.isActive).length;
    const contacted = allLeads.items.filter((lead) => lead.contacted).length;
    const notContacted = allLeads.items.filter((lead) => !lead.contacted).length;

    return {
      total,
      active,
      inactive,
      contacted,
      notContacted,
    };
  }

  /**
   * Helper method to sort items in memory
   */
  private sortItems(items: ILead[], sortBy: string, sortOrder: string): ILead[] {
    return items.sort((a, b) => {
      const aVal = (a as any)[sortBy];
      const bVal = (b as any)[sortBy];

      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }
}

export default new LeadRepository();
