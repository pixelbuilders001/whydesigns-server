import Lead, { ILead } from '../models/lead.model';
import mongoose from 'mongoose';

export interface LeadFilters {
  isActive?: boolean;
  search?: string;
  areaOfInterest?: string;
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

class LeadRepository {
  /**
   * Create a new lead
   */
  async create(leadData: Partial<ILead>): Promise<ILead> {
    const lead = await Lead.create(leadData);
    return lead;
  }

  /**
   * Find lead by ID
   */
  async findById(id: string): Promise<ILead | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }
    return await Lead.findById(id);
  }

  /**
   * Find all leads with filters and pagination
   */
  async findAll(
    filters: LeadFilters = {},
    options: PaginationOptions = {}
  ): Promise<{ leads: ILead[]; total: number; page: number; totalPages: number }> {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = options;
    const skip = (page - 1) * limit;

    // Build query
    const query: any = {};

    if (filters.isActive !== undefined) {
      query.isActive = filters.isActive;
    }

    if (filters.areaOfInterest) {
      query.areaOfInterest = new RegExp(filters.areaOfInterest, 'i');
    }

    if (filters.search) {
      query.$text = { $search: filters.search };
    }

    // Execute query
    const [leads, total] = await Promise.all([
      Lead.find(query)
        .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
        .skip(skip)
        .limit(limit),
      Lead.countDocuments(query),
    ]);

    return {
      leads,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Update lead
   */
  async update(id: string, updateData: Partial<ILead>): Promise<ILead | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }
    return await Lead.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });
  }

  /**
   * Delete lead (soft delete)
   */
  async softDelete(id: string): Promise<ILead | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }
    return await Lead.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );
  }

  /**
   * Hard delete lead
   */
  async delete(id: string): Promise<ILead | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }
    return await Lead.findByIdAndDelete(id);
  }

  /**
   * Update isActive status
   */
  async updateActiveStatus(id: string, isActive: boolean): Promise<ILead | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }
    return await Lead.findByIdAndUpdate(
      id,
      { isActive },
      { new: true }
    );
  }

  /**
   * Check if lead exists by email
   */
  async existsByEmail(email: string): Promise<boolean> {
    const count = await Lead.countDocuments({
      email: email.toLowerCase(),
      isActive: true,
    });
    return count > 0;
  }

  /**
   * Get lead statistics
   */
  async getStats(): Promise<any> {
    const [total, active, inactive] = await Promise.all([
      Lead.countDocuments(),
      Lead.countDocuments({ isActive: true }),
      Lead.countDocuments({ isActive: false }),
    ]);

    return {
      total,
      active,
      inactive,
    };
  }
}

export default new LeadRepository();
