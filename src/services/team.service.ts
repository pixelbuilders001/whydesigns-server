import teamRepository, { TeamFilters, PaginationOptions } from '../repositories/team.repository';
import { ITeam } from '../models/team.model';
import { AppError } from '../utils/AppError';

class TeamService {
  /**
   * Create a new team member
   */
  async createTeamMember(teamData: Partial<ITeam>): Promise<ITeam> {
    const team = await teamRepository.create(teamData);
    return team;
  }

  /**
   * Get all team members with filters
   */
  async getAllTeamMembers(
    filters: TeamFilters = {},
    options: PaginationOptions = {}
  ): Promise<{ teams: ITeam[]; total: number; page: number; totalPages: number }> {
    return await teamRepository.findAll(filters, options);
  }

  /**
   * Get published team members (Public)
   */
  async getPublishedTeamMembers(
    options: PaginationOptions = {}
  ): Promise<{ teams: ITeam[]; total: number; page: number; totalPages: number }> {
    return await teamRepository.findPublished(options);
  }

  /**
   * Get team member by ID
   */
  async getTeamMemberById(id: string): Promise<ITeam> {
    const team = await teamRepository.findById(id);
    if (!team) {
      throw new AppError('Team member not found', 404);
    }
    return team;
  }

  /**
   * Update team member
   */
  async updateTeamMember(id: string, updateData: Partial<ITeam>): Promise<ITeam> {
    // Verify team member exists
    await this.getTeamMemberById(id);

    const updatedTeam = await teamRepository.update(id, updateData);
    if (!updatedTeam) {
      throw new AppError('Failed to update team member', 500);
    }

    return updatedTeam;
  }

  /**
   * Delete team member (hard delete)
   */
  async deleteTeamMember(id: string): Promise<ITeam> {
    await this.getTeamMemberById(id);

    const deleted = await teamRepository.delete(id);
    if (!deleted) {
      throw new AppError('Failed to delete team member', 500);
    }

    return deleted;
  }

  /**
   * Soft delete team member
   */
  async deactivateTeamMember(id: string): Promise<ITeam> {
    await this.getTeamMemberById(id);

    const deactivated = await teamRepository.softDelete(id);
    if (!deactivated) {
      throw new AppError('Failed to deactivate team member', 500);
    }

    return deactivated;
  }

  /**
   * Publish team member
   */
  async publishTeamMember(id: string): Promise<ITeam> {
    const team = await teamRepository.publish(id);
    if (!team) {
      throw new AppError('Team member not found', 404);
    }
    return team;
  }

  /**
   * Unpublish team member
   */
  async unpublishTeamMember(id: string): Promise<ITeam> {
    const team = await teamRepository.unpublish(id);
    if (!team) {
      throw new AppError('Team member not found', 404);
    }
    return team;
  }

  /**
   * Get team statistics
   */
  async getTeamStats(): Promise<any> {
    return await teamRepository.getStats();
  }
}

export default new TeamService();
