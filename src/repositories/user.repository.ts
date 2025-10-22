import { User, IUser } from '../models/user.model';
import { PaginationOptions } from '../types';

export class UserRepository {
  async create(userData: Partial<IUser>): Promise<IUser> {
    const user = await User.create(userData);
    return user;
  }

  async findById(id: string): Promise<IUser | null> {
    return await User.findOne({ _id: id, isActive: true }).populate('roleId');
  }

  async findByIdWithRole(id: string): Promise<IUser | null> {
    return await User.findOne({ _id: id, isActive: true }).populate('roleId');
  }

  async findByIdWithPassword(id: string): Promise<IUser | null> {
    return await User.findOne({ _id: id, isActive: true }).select('+password');
  }

  async findByEmail(email: string): Promise<IUser | null> {
    return await User.findOne({ email, isActive: true }).populate('roleId');
  }

  async findByEmailWithPassword(email: string): Promise<IUser | null> {
    return await User.findOne({ email, isActive: true }).select('+password +refreshToken').populate('roleId');
  }

  async findByPhone(phoneNumber: string): Promise<IUser | null> {
    return await User.findOne({ phoneNumber, isActive: true }).populate('roleId');
  }

  async findAll(options: PaginationOptions): Promise<{ users: IUser[]; total: number }> {
    const { page, limit, sortBy, order } = options;
    const skip = (page - 1) * limit;

    const sortOrder = order === 'desc' ? -1 : 1;
    const sortOptions: any = { [sortBy]: sortOrder };

    // Build filter
    const filter: any = { isActive: true };

    const [users, total] = await Promise.all([
      User.find(filter)
        .populate('roleId')
        .sort(sortOptions)
        .skip(skip)
        .limit(limit),
      User.countDocuments(filter),
    ]);

    return { users, total };
  }

  async update(id: string, updateData: Partial<IUser>): Promise<IUser | null> {
    return await User.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).populate('roleId');
  }

  async delete(id: string): Promise<IUser | null> {
    return await User.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    ).populate('roleId');
  }

  async hardDelete(id: string): Promise<IUser | null> {
    return await User.findByIdAndDelete(id);
  }

  async existsByEmail(email: string): Promise<boolean> {
    const count = await User.countDocuments({ email, isActive: true });
    return count > 0;
  }

  async existsByPhone(phoneNumber: string): Promise<boolean> {
    const count = await User.countDocuments({ phoneNumber, isActive: true });
    return count > 0;
  }

  async softDelete(id: string): Promise<IUser | null> {
    return await User.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    ).populate('roleId');
  }

  async updateRefreshToken(id: string, refreshToken: string | null): Promise<void> {
    await User.findByIdAndUpdate(id, { refreshToken });
  }

  async getRefreshToken(id: string): Promise<string | null> {
    const user = await User.findById(id).select('+refreshToken');
    return user?.refreshToken || null;
  }

  async findByRefreshToken(refreshToken: string): Promise<IUser | null> {
    return await User.findOne({ refreshToken, isActive: true }).select('+refreshToken').populate('roleId');
  }

  // Search and filter methods
  async search(query: string, options: PaginationOptions): Promise<{ users: IUser[]; total: number }> {
    const { page, limit, sortBy, order } = options;
    const skip = (page - 1) * limit;

    const sortOrder = order === 'desc' ? -1 : 1;
    const sortOptions: any = { [sortBy]: sortOrder };

    const searchFilter = {
      isActive: true,
      $or: [
        { firstName: { $regex: query, $options: 'i' } },
        { lastName: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } },
        { phoneNumber: { $regex: query, $options: 'i' } },
      ],
    };

    const [users, total] = await Promise.all([
      User.find(searchFilter)
        .populate('roleId')
        .sort(sortOptions)
        .skip(skip)
        .limit(limit),
      User.countDocuments(searchFilter),
    ]);

    return { users, total };
  }

  async findByRole(roleId: string, options: PaginationOptions): Promise<{ users: IUser[]; total: number }> {
    const { page, limit, sortBy, order } = options;
    const skip = (page - 1) * limit;

    const sortOrder = order === 'desc' ? -1 : 1;
    const sortOptions: any = { [sortBy]: sortOrder };

    const [users, total] = await Promise.all([
      User.find({ roleId, isActive: true })
        .populate('roleId')
        .sort(sortOptions)
        .skip(skip)
        .limit(limit),
      User.countDocuments({ roleId, isActive: true }),
    ]);

    return { users, total };
  }

  async findByProvider(provider: string, options: PaginationOptions): Promise<{ users: IUser[]; total: number }> {
    const { page, limit, sortBy, order } = options;
    const skip = (page - 1) * limit;

    const sortOrder = order === 'desc' ? -1 : 1;
    const sortOptions: any = { [sortBy]: sortOrder };

    const [users, total] = await Promise.all([
      User.find({ provider, isActive: true })
        .populate('roleId')
        .sort(sortOptions)
        .skip(skip)
        .limit(limit),
      User.countDocuments({ provider, isActive: true }),
    ]);

    return { users, total };
  }

  async countByRole(roleId: string): Promise<number> {
    return await User.countDocuments({ roleId, isActive: true });
  }

  async countByProvider(provider: string): Promise<number> {
    return await User.countDocuments({ provider, isActive: true });
  }

  async countActive(): Promise<number> {
    return await User.countDocuments({ isActive: true });
  }

  async countInactive(): Promise<number> {
    return await User.countDocuments({ isActive: false });
  }
}

export default new UserRepository();
