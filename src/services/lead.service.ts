import leadRepository, { LeadFilters, PaginationOptions } from '../repositories/lead.repository';
import { ILead, LeadResponse, LeadContactedByUser, LeadLatestActivity } from '../models/lead.model';
import { AppError } from '../utils/AppError';
import userRepository from '../repositories/user.repository';
import leadActivityRepository from '../repositories/leadActivity.repository';

class LeadService {
  /**
   * Helper method to populate contacted by user info
   */
  private async populateContactedBy(lead: ILead): Promise<LeadContactedByUser | undefined> {
    if (!lead.contactedBy) {
      return undefined;
    }

    const user = await userRepository.findById(lead.contactedBy);

    if (!user) {
      return {
        id: lead.contactedBy,
        name: 'Unknown User',
        email: '',
      };
    }

    return {
      id: user.id,
      name: `${user.firstName} ${user.lastName}`.trim() || 'Unknown User',
      email: user.email,
    };
  }

  /**
   * Helper method to populate latest activity info
   */
  private async populateLatestActivity(leadId: string): Promise<{ latestActivity?: LeadLatestActivity; totalActivities: number }> {
    // Get all activities for this lead sorted by createdAt (most recent first)
    const { activities, total } = await leadActivityRepository.findByLeadId(leadId, {
      page: 1,
      limit: 1,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });

    if (activities.length === 0) {
      return { latestActivity: undefined, totalActivities: 0 };
    }

    const activity = activities[0];

    // Get counselor info
    const counselor = await userRepository.findById(activity.counselorId);
    const counselorName = counselor
      ? `${counselor.firstName} ${counselor.lastName}`.trim() || 'Unknown User'
      : 'Unknown User';

    return {
      latestActivity: {
        id: activity.id,
        activityType: activity.activityType,
        activityDate: activity.activityDate,
        remarks: activity.remarks,
        nextFollowUpDate: activity.nextFollowUpDate,
        counselorId: activity.counselorId,
        counselorName,
      },
      totalActivities: total,
    };
  }

  /**
   * Helper method to populate lead with related data
   */
  private async populateLead(lead: ILead): Promise<LeadResponse> {
    const [contactedBy, activityData] = await Promise.all([
      this.populateContactedBy(lead),
      this.populateLatestActivity(lead.id),
    ]);

    const { contactedBy: contactedById, ...leadData } = lead;

    return {
      ...leadData,
      contactedBy,
      latestActivity: activityData.latestActivity,
      totalActivities: activityData.totalActivities,
    };
  }
  /**
   * Create a new lead
   */
  async createLead(leadData: Partial<ILead>): Promise<ILead> {
    const lead = await leadRepository.create(leadData);
    return lead;
  }

  /**
   * Get all leads with filters
   */
  async getAllLeads(
    filters: LeadFilters = {},
    options: PaginationOptions = {}
  ): Promise<{ leads: ILead[]; total: number; page: number; totalPages: number }> {
    return await leadRepository.findAll(filters, options);
  }

  /**
   * Get all leads with populated data (activity and contacted user)
   */
  async getAllLeadsWithData(
    filters: LeadFilters = {},
    options: PaginationOptions = {}
  ): Promise<{ leads: LeadResponse[]; total: number; page: number; totalPages: number }> {
    const result = await leadRepository.findAll(filters, options);
    const leadsWithData = await Promise.all(
      result.leads.map(lead => this.populateLead(lead))
    );
    return {
      leads: leadsWithData,
      total: result.total,
      page: result.page,
      totalPages: result.totalPages,
    };
  }

  /**
   * Get lead by ID
   */
  async getLeadById(id: string): Promise<ILead> {
    const lead = await leadRepository.findById(id);
    if (!lead) {
      throw new AppError('Lead not found', 404);
    }
    return lead;
  }

  /**
   * Get lead by ID with populated data
   */
  async getLeadByIdWithData(id: string): Promise<LeadResponse> {
    const lead = await this.getLeadById(id);
    return await this.populateLead(lead);
  }

  /**
   * Update lead
   */
  async updateLead(id: string, updateData: Partial<ILead>): Promise<ILead> {
    // Check if lead exists
    await this.getLeadById(id);

    const updatedLead = await leadRepository.update(id, updateData);
    if (!updatedLead) {
      throw new AppError('Failed to update lead', 500);
    }

    return updatedLead;
  }

  /**
   * Delete lead
   */
  async deleteLead(id: string): Promise<void> {
    // Check if lead exists
    await this.getLeadById(id);

    await leadRepository.delete(id);
  }

  /**
   * Update isActive status
   */
  async updateActiveStatus(id: string, isActive: boolean): Promise<ILead> {
    // Check if lead exists
    await this.getLeadById(id);

    const lead = await leadRepository.updateActiveStatus(id, isActive);
    if (!lead) {
      throw new AppError('Failed to update lead status', 500);
    }

    return lead;
  }

  /**
   * Mark lead as contacted
   */
  async markAsContacted(id: string, userId: string): Promise<ILead> {
    // Check if lead exists
    await this.getLeadById(id);

    const lead = await leadRepository.markAsContacted(id, userId);
    if (!lead) {
      throw new AppError('Failed to mark lead as contacted', 500);
    }

    return lead;
  }

  /**
   * Mark lead as not contacted
   */
  async markAsNotContacted(id: string): Promise<ILead> {
    // Check if lead exists
    await this.getLeadById(id);

    const lead = await leadRepository.markAsNotContacted(id);
    if (!lead) {
      throw new AppError('Failed to mark lead as not contacted', 500);
    }

    return lead;
  }

  /**
   * Get lead statistics
   */
  async getLeadStats(): Promise<any> {
    return await leadRepository.getStats();
  }
}

export default new LeadService();
