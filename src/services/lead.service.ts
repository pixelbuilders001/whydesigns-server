import leadRepository, { LeadFilters, PaginationOptions } from '../repositories/lead.repository';
import { ILead } from '../models/lead.model';
import { AppError } from '../utils/AppError';

class LeadService {
  /**
   * Create a new lead
   */
  async createLead(leadData: Partial<ILead>): Promise<ILead> {
    // Check if lead with same email already exists
    if (leadData.email) {
      const exists = await leadRepository.existsByEmail(leadData.email);
      if (exists) {
        throw new AppError('Lead with this email already exists', 400);
      }
    }

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
   * Update lead
   */
  async updateLead(id: string, updateData: Partial<ILead>): Promise<ILead> {
    // Check if lead exists
    await this.getLeadById(id);

    // If email is being updated, check if it's already taken
    if (updateData.email) {
      const existingLead = await leadRepository.findById(id);
      if (existingLead && existingLead.email !== updateData.email.toLowerCase()) {
        const emailExists = await leadRepository.existsByEmail(updateData.email);
        if (emailExists) {
          throw new AppError('Lead with this email already exists', 400);
        }
      }
    }

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
   * Get lead statistics
   */
  async getLeadStats(): Promise<any> {
    return await leadRepository.getStats();
  }
}

export default new LeadService();
