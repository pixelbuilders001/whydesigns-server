import { Counselor, ICounselor } from '../models/counselor.model';
import { PaginationOptions } from '../types';

export class CounselorRepository {
  async create(counselorData: Partial<ICounselor>): Promise<ICounselor> {
    const counselor = await Counselor.create(counselorData);
    return counselor;
  }

  async findById(id: string): Promise<ICounselor | null> {
    return await Counselor.findById(id);
  }

  async findAll(options: PaginationOptions, filters: { isActive?: boolean } = {}): Promise<{ counselors: ICounselor[]; total: number }> {
    const { page, limit, sortBy, order } = options;
    const skip = (page - 1) * limit;

    const sortOrder = order === 'desc' ? -1 : 1;
    const sortOptions: any = { [sortBy]: sortOrder };

    // Build filter
    const filter: any = {};
    if (filters.isActive !== undefined) filter.isActive = filters.isActive;

    const [counselors, total] = await Promise.all([
      Counselor.find(filter)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit),
      Counselor.countDocuments(filter),
    ]);

    return { counselors, total };
  }

  async update(id: string, updateData: Partial<ICounselor>): Promise<ICounselor | null> {
    return await Counselor.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });
  }

  async hardDelete(id: string): Promise<ICounselor | null> {
    return await Counselor.findByIdAndDelete(id);
  }

  async softDelete(id: string): Promise<ICounselor | null> {
    return await Counselor.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );
  }

  async countActive(): Promise<number> {
    return await Counselor.countDocuments({ isActive: true });
  }

  async countInactive(): Promise<number> {
    return await Counselor.countDocuments({ isActive: false });
  }

  async search(query: string, options: PaginationOptions): Promise<{ counselors: ICounselor[]; total: number }> {
    const { page, limit, sortBy, order } = options;
    const skip = (page - 1) * limit;

    const sortOrder = order === 'desc' ? -1 : 1;
    const sortOptions: any = { [sortBy]: sortOrder };

    const searchFilter = {
      isActive: true,
      $or: [
        { fullName: { $regex: query, $options: 'i' } },
        { title: { $regex: query, $options: 'i' } },
        { bio: { $regex: query, $options: 'i' } },
        { specialties: { $regex: query, $options: 'i' } },
      ],
    };

    const [counselors, total] = await Promise.all([
      Counselor.find(searchFilter)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit),
      Counselor.countDocuments(searchFilter),
    ]);

    return { counselors, total };
  }

  async findBySpecialty(specialty: string, options: PaginationOptions): Promise<{ counselors: ICounselor[]; total: number }> {
    const { page, limit, sortBy, order } = options;
    const skip = (page - 1) * limit;

    const sortOrder = order === 'desc' ? -1 : 1;
    const sortOptions: any = { [sortBy]: sortOrder };

    const filter = {
      isActive: true,
      specialties: { $regex: specialty, $options: 'i' },
    };

    const [counselors, total] = await Promise.all([
      Counselor.find(filter)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit),
      Counselor.countDocuments(filter),
    ]);

    return { counselors, total };
  }

  async findTopRated(limit: number = 10): Promise<ICounselor[]> {
    return await Counselor.find({ isActive: true })
      .sort({ rating: -1 })
      .limit(limit);
  }

  async findMostExperienced(limit: number = 10): Promise<ICounselor[]> {
    return await Counselor.find({ isActive: true })
      .sort({ yearsOfExperience: -1 })
      .limit(limit);
  }

  async getAverageRating(): Promise<number> {
    const result = await Counselor.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: null, avgRating: { $avg: '$rating' } } },
    ]);
    return result.length > 0 ? result[0].avgRating : 0;
  }

  async countBySpecialty(specialty: string): Promise<number> {
    return await Counselor.countDocuments({
      isActive: true,
      specialties: { $regex: specialty, $options: 'i' },
    });
  }

  async getAllSpecialties(): Promise<string[]> {
    const counselors = await Counselor.find({ isActive: true }).select('specialties');
    const specialtiesSet = new Set<string>();
    counselors.forEach(counselor => {
      counselor.specialties.forEach(specialty => specialtiesSet.add(specialty));
    });
    return Array.from(specialtiesSet).sort();
  }

  async getStats(): Promise<any> {
    const [total, active, inactive] = await Promise.all([
      Counselor.countDocuments(),
      Counselor.countDocuments({ isActive: true }),
      Counselor.countDocuments({ isActive: false }),
    ]);

    const avgRating = await this.getAverageRating();

    return {
      total,
      active,
      inactive,
      averageRating: avgRating.toFixed(2),
    };
  }
}

export default new CounselorRepository();
