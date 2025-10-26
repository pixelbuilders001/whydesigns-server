import LeadActivity, { ILeadActivity } from '../models/leadActivity.model';

export interface PaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

class LeadActivityRepository {
  /**
   * Create a new lead activity
   */
  async create(activityData: Partial<ILeadActivity>): Promise<ILeadActivity> {
    const activity = new LeadActivity(activityData);
    return await activity.save();
  }

  /**
   * Find activity by ID
   */
  async findById(id: string): Promise<ILeadActivity | null> {
    return await LeadActivity.findById(id)
      .populate('counselorId', 'firstName lastName email')
      .populate('leadId', 'fullName email phone');
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

    const skip = (page - 1) * limit;
    const sort: any = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [activities, total] = await Promise.all([
      LeadActivity.find({ leadId, isActive: true })
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate('counselorId', 'firstName lastName email')
        .lean(),
      LeadActivity.countDocuments({ leadId, isActive: true }),
    ]);

    return { activities: activities as ILeadActivity[], total };
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

    const skip = (page - 1) * limit;
    const sort: any = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [activities, total] = await Promise.all([
      LeadActivity.find({ counselorId, isActive: true })
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate('leadId', 'fullName email phone')
        .lean(),
      LeadActivity.countDocuments({ counselorId, isActive: true }),
    ]);

    return { activities: activities as ILeadActivity[], total };
  }

  /**
   * Update activity by ID
   */
  async update(id: string, updateData: Partial<ILeadActivity>): Promise<ILeadActivity | null> {
    return await LeadActivity.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    })
      .populate('counselorId', 'firstName lastName email')
      .populate('leadId', 'fullName email phone');
  }

  /**
   * Soft delete activity
   */
  async softDelete(id: string): Promise<ILeadActivity | null> {
    return await LeadActivity.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );
  }

  /**
   * Hard delete activity
   */
  async delete(id: string): Promise<void> {
    await LeadActivity.findByIdAndDelete(id);
  }

  /**
   * Get activity statistics for a lead
   */
  async getLeadActivityStats(leadId: string): Promise<any> {
    const stats = await LeadActivity.aggregate([
      { $match: { leadId: leadId as any, isActive: true } },
      {
        $group: {
          _id: '$activityType',
          count: { $sum: 1 },
          lastActivity: { $max: '$activityDate' },
        },
      },
    ]);

    const total = await LeadActivity.countDocuments({ leadId, isActive: true });

    return {
      total,
      byType: stats,
    };
  }

  /**
   * Get recent activities across all leads
   */
  async getRecentActivities(limit: number = 10): Promise<ILeadActivity[]> {
    return await LeadActivity.find({ isActive: true })
      .sort({ activityDate: -1 })
      .limit(limit)
      .populate('counselorId', 'firstName lastName email')
      .populate('leadId', 'fullName email phone')
      .lean() as ILeadActivity[];
  }
}

export default new LeadActivityRepository();
