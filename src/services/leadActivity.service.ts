import leadActivityRepository, { PaginationOptions } from '../repositories/leadActivity.repository';
import leadRepository from '../repositories/lead.repository';
import userRepository from '../repositories/user.repository';
import { ILeadActivity, LeadActivityResponse, CounselorInfo } from '../models/leadActivity.model';
import { NotFoundError, BadRequestError } from '../utils/AppError';

class LeadActivityService {
  /**
   * Helper method to populate counselor data in activity
   */
  private async populateCounselorData(activity: ILeadActivity): Promise<LeadActivityResponse> {
    const counselor = await userRepository.findById(activity.counselorId);

    const counselorInfo: CounselorInfo = {
      id: activity.counselorId,
      name: counselor ? `${counselor.firstName || ''} ${counselor.lastName || ''}`.trim() || 'Unknown' : 'Unknown',
      email: counselor?.email || 'N/A',
    };

    // Remove counselorId, nextFollowUpDate, and followupDate to handle them separately
    const { counselorId, nextFollowUpDate, followupDate, ...activityCore } = activity;

    // Helper to check if a value is a valid non-empty string
    const isValidString = (val: any): val is string => {
      return typeof val === 'string' && val.length > 0;
    };

    // Helper to check if value is an empty object (from DynamoDB)
    const isEmptyObject = (val: any): boolean => {
      return val !== null &&
             val !== undefined &&
             typeof val === 'object' &&
             !Array.isArray(val) &&
             Object.keys(val).length === 0;
    };

    // Helper to clean a value - return undefined if it's an empty object
    const cleanValue = (val: any): any => {
      if (isEmptyObject(val)) {
        return undefined;
      }
      return val;
    };

    // Build response object manually to avoid spreading empty objects from DynamoDB
    const response: LeadActivityResponse = {
      id: activityCore.id,
      leadId: activityCore.leadId,
      activityType: activityCore.activityType,
      activityDate: activityCore.activityDate,
      createdAt: activityCore.createdAt,
      updatedAt: activityCore.updatedAt,
      isActive: activityCore.isActive,
      counselor: counselorInfo,
      formattedActivityDate: activity.activityDate, // Already ISO string from DynamoDB
    };

    // Only add optional fields if they have valid values
    if (activityCore.remarks) {
      response.remarks = activityCore.remarks;
    }

    // Clean and add date fields only if they are valid strings (not empty objects)
    const cleanedNextFollowUpDate = cleanValue(nextFollowUpDate);
    if (isValidString(cleanedNextFollowUpDate)) {
      response.nextFollowUpDate = cleanedNextFollowUpDate;
      response.formattedNextFollowUpDate = cleanedNextFollowUpDate;
    }

    const cleanedFollowupDate = cleanValue(followupDate);
    if (isValidString(cleanedFollowupDate)) {
      response.followupDate = cleanedFollowupDate;
      response.formattedFollowupDate = cleanedFollowupDate;
    }

    return response;
  }

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
  ): Promise<{ activities: LeadActivityResponse[]; total: number; page: number; totalPages: number }> {
    // Verify lead exists
    const lead = await leadRepository.findById(leadId);
    if (!lead) {
      throw new NotFoundError('Lead not found');
    }

    const { page = 1, limit = 10 } = options;
    const { activities, total } = await leadActivityRepository.findByLeadId(leadId, options);

    // Populate counselor data for all activities
    const populatedActivities = await Promise.all(
      activities.map(activity => this.populateCounselorData(activity))
    );

    return {
      activities: populatedActivities,
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
  ): Promise<{ activities: LeadActivityResponse[]; total: number; page: number; totalPages: number }> {
    const { page = 1, limit = 10 } = options;
    const { activities, total } = await leadActivityRepository.findByCounselorId(counselorId, options);

    // Populate counselor data for all activities
    const populatedActivities = await Promise.all(
      activities.map(activity => this.populateCounselorData(activity))
    );

    return {
      activities: populatedActivities,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get recent activities
   */
  async getRecentActivities(limit: number = 10): Promise<LeadActivityResponse[]> {
    const activities = await leadActivityRepository.getRecentActivities(limit);

    // Populate counselor data for all activities
    const populatedActivities = await Promise.all(
      activities.map(activity => this.populateCounselorData(activity))
    );

    return populatedActivities;
  }
}

export default new LeadActivityService();
