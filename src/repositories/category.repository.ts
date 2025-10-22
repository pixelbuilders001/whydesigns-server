import { Category, ICategory } from '../models/category.model';
import { PaginationOptions } from '../types';

export class CategoryRepository {
  async create(categoryData: Partial<ICategory>): Promise<ICategory> {
    const category = await Category.create(categoryData);
    return category;
  }

  async findById(id: string): Promise<ICategory | null> {
    return await Category.findOne({ _id: id, isActive: true }).populate('createdBy', 'firstName lastName email');
  }

  async findBySlug(slug: string): Promise<ICategory | null> {
    return await Category.findOne({ slug, isActive: true }).populate('createdBy', 'firstName lastName email');
  }

  async findByName(name: string): Promise<ICategory | null> {
    return await Category.findOne({ name, isActive: true });
  }

  async findAll(options: PaginationOptions): Promise<{ categories: ICategory[]; total: number }> {
    const { page, limit, sortBy, order } = options;
    const skip = (page - 1) * limit;

    const sortOrder = order === 'desc' ? -1 : 1;
    const sortOptions: any = { [sortBy]: sortOrder };

    // Build filter - only show active categories for public view
    const filter: any = { isActive: true };

    const [categories, total] = await Promise.all([
      Category.find(filter)
        .populate('createdBy', 'firstName lastName email')
        .sort(sortOptions)
        .skip(skip)
        .limit(limit),
      Category.countDocuments(filter),
    ]);

    return { categories, total };
  }

  async findAllWithInactive(options: PaginationOptions): Promise<{ categories: ICategory[]; total: number }> {
    const { page, limit, sortBy, order } = options;
    const skip = (page - 1) * limit;

    const sortOrder = order === 'desc' ? -1 : 1;
    const sortOptions: any = { [sortBy]: sortOrder };

    const [categories, total] = await Promise.all([
      Category.find()
        .populate('createdBy', 'firstName lastName email')
        .sort(sortOptions)
        .skip(skip)
        .limit(limit),
      Category.countDocuments(),
    ]);

    return { categories, total };
  }

  async update(id: string, updateData: Partial<ICategory>): Promise<ICategory | null> {
    return await Category.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).populate('createdBy', 'firstName lastName email');
  }

  async delete(id: string): Promise<ICategory | null> {
    return await Category.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    ).populate('createdBy', 'firstName lastName email');
  }

  async hardDelete(id: string): Promise<ICategory | null> {
    return await Category.findByIdAndDelete(id);
  }

  async softDelete(id: string): Promise<ICategory | null> {
    return await Category.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    ).populate('createdBy', 'firstName lastName email');
  }

  async existsByName(name: string, excludeId?: string): Promise<boolean> {
    const filter: any = { name };
    if (excludeId) {
      filter._id = { $ne: excludeId };
    }
    const count = await Category.countDocuments(filter);
    return count > 0;
  }

  async existsBySlug(slug: string, excludeId?: string): Promise<boolean> {
    const filter: any = { slug };
    if (excludeId) {
      filter._id = { $ne: excludeId };
    }
    const count = await Category.countDocuments(filter);
    return count > 0;
  }

  async countActive(): Promise<number> {
    return await Category.countDocuments({ isActive: true });
  }

  async countInactive(): Promise<number> {
    return await Category.countDocuments({ isActive: false });
  }

  async search(query: string, options: PaginationOptions): Promise<{ categories: ICategory[]; total: number }> {
    const { page, limit, sortBy, order } = options;
    const skip = (page - 1) * limit;

    const sortOrder = order === 'desc' ? -1 : 1;
    const sortOptions: any = { [sortBy]: sortOrder };

    const searchFilter = {
      isActive: true,
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
      ],
    };

    const [categories, total] = await Promise.all([
      Category.find(searchFilter)
        .populate('createdBy', 'firstName lastName email')
        .sort(sortOptions)
        .skip(skip)
        .limit(limit),
      Category.countDocuments(searchFilter),
    ]);

    return { categories, total };
  }
}

export default new CategoryRepository();
