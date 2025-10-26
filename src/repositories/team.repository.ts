import Team, { ITeam } from '../models/team.model';

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

class TeamRepository {
  /**
   * Create a new team member
   */
  async create(teamData: Partial<ITeam>): Promise<ITeam> {
    const team = new Team(teamData);
    return await team.save();
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

    const query: any = {};

    // Apply filters
    if (filters.isPublished !== undefined) {
      query.isPublished = filters.isPublished;
    }

    if (filters.isActive !== undefined) {
      query.isActive = filters.isActive;
    }

    // Apply search filter
    if (filters.search) {
      query.$text = { $search: filters.search };
    }

    const skip = (page - 1) * limit;
    const sort: any = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [teams, total] = await Promise.all([
      Team.find(query).sort(sort).skip(skip).limit(limit),
      Team.countDocuments(query),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      teams,
      total,
      page,
      totalPages,
    };
  }

  /**
   * Find team member by ID
   */
  async findById(id: string): Promise<ITeam | null> {
    return await Team.findById(id);
  }

  /**
   * Update team member
   */
  async update(id: string, updateData: Partial<ITeam>): Promise<ITeam | null> {
    return await Team.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });
  }

  /**
   * Delete team member (hard delete)
   */
  async delete(id: string): Promise<ITeam | null> {
    return await Team.findByIdAndDelete(id);
  }

  /**
   * Soft delete team member
   */
  async softDelete(id: string): Promise<ITeam | null> {
    return await Team.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );
  }

  /**
   * Publish team member
   */
  async publish(id: string): Promise<ITeam | null> {
    return await Team.findByIdAndUpdate(
      id,
      {
        isPublished: true,
        publishedAt: new Date(),
      },
      { new: true }
    );
  }

  /**
   * Unpublish team member
   */
  async unpublish(id: string): Promise<ITeam | null> {
    return await Team.findByIdAndUpdate(
      id,
      { isPublished: false },
      { new: true }
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
    const [total, published, unpublished, active, inactive] = await Promise.all([
      Team.countDocuments(),
      Team.countDocuments({ isPublished: true }),
      Team.countDocuments({ isPublished: false }),
      Team.countDocuments({ isActive: true }),
      Team.countDocuments({ isActive: false }),
    ]);

    return {
      total,
      published,
      unpublished,
      active,
      inactive,
    };
  }
}

export default new TeamRepository();
