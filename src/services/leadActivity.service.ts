import leadActivityRepository, { PaginationOptions } from '../repositories/leadActivity.repository';
import leadRepository from '../repositories/lead.repository';
import { ILeadActivity } from '../models/leadActivity.model';
import { NotFoundError, BadRequestError } from '../utils/AppError';

class LeadActivityService {
  /**
   * Create a new lead activity
   */
  async createActivity(
    leadId: string,
    counselorId: string,
    activityData: Partial<ILeadActivity>
  ): Promise<ILeadActivity> {
    // Verify lead exists
    const lead = await leadRepository.findById(leadId);
    if (!lead) {
      throw new NotFoundError('Lead not found');
    }

    // Create activity
    const activity = await leadActivityRepository.create({
      ...activityData,
      leadId: leadId as any,
      counselorId: counselorId as any,
    });

    return activity;
  }

  /**
   * Get all activities for a lead
   */
  async getLeadActivities(
    leadId: string,
    options: PaginationOptions = {}
  ): Promise<{ activities: ILeadActivity[]; total: number; page: number; totalPages: number }> {
    // Verify lead exists
    const lead = await leadRepository.findById(leadId);
    if (!lead) {
      throw new NotFoundError('Lead not found');
    }

    const { page = 1, limit = 10 } = options;
    const { activities, total } = await leadActivityRepository.findByLeadId(leadId, options);

    return {
      activities,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get activity by ID
   */
  async getActivityById(activityId: string): Promise<ILeadActivity> {
    const activity = await leadActivityRepository.findById(activityId);
    if (!activity) {
      throw new NotFoundError('Activity not found');
    }
    return activity;
  }

  /**
   * Update activity
   */
  async updateActivity(
    activityId: string,
    counselorId: string,
    updateData: Partial<ILeadActivity>
  ): Promise<ILeadActivity> {
    // Get existing activity
    const activity = await leadActivityRepository.findById(activityId);
    if (!activity) {
      throw new NotFoundError('Activity not found');
    }

    // Verify counselor owns this activity
    if (activity.counselorId.toString() !== counselorId) {
      throw new BadRequestError('You can only update your own activities');
    }

    // Remove fields that shouldn't be updated
    delete (updateData as any).leadId;
    delete (updateData as any).counselorId;
    delete (updateData as any).createdAt;

    const updatedActivity = await leadActivityRepository.update(activityId, updateData);
    if (!updatedActivity) {
      throw new NotFoundError('Failed to update activity');
    }

    return updatedActivity;
  }

  /**
   * Delete activity
   */
  async deleteActivity(activityId: string, counselorId: string): Promise<void> {
    // Get existing activity
    const activity = await leadActivityRepository.findById(activityId);
    if (!activity) {
      throw new NotFoundError('Activity not found');
    }

    // Verify counselor owns this activity
    if (activity.counselorId.toString() !== counselorId) {
      throw new BadRequestError('You can only delete your own activities');
    }

    await leadActivityRepository.softDelete(activityId);
  }

  /**
   * Get activity statistics for a lead
   */
  async getLeadActivityStats(leadId: string): Promise<any> {
    // Verify lead exists
    const lead = await leadRepository.findById(leadId);
    if (!lead) {
      throw new NotFoundError('Lead not found');
    }

    return await leadActivityRepository.getLeadActivityStats(leadId);
  }

  /**
   * Get counselor's activities
   */
  async getCounselorActivities(
    counselorId: string,
    options: PaginationOptions = {}
  ): Promise<{ activities: ILeadActivity[]; total: number; page: number; totalPages: number }> {
    const { page = 1, limit = 10 } = options;
    const { activities, total } = await leadActivityRepository.findByCounselorId(counselorId, options);

    return {
      activities,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get recent activities
   */
  async getRecentActivities(limit: number = 10): Promise<ILeadActivity[]> {
    return await leadActivityRepository.getRecentActivities(limit);
  }
}

export default new LeadActivityService();
