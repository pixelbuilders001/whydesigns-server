import { Role, IRole } from '../models/role.model';

export class RoleRepository {
  async create(roleData: Partial<IRole>): Promise<IRole> {
    const role = await Role.create(roleData);
    return role;
  }

  async findById(id: string): Promise<IRole | null> {
    return await Role.findById(id);
  }

  async findByName(name: string): Promise<IRole | null> {
    return await Role.findOne({ name: name.toUpperCase() });
  }

  async findAll(): Promise<IRole[]> {
    return await Role.find({ isActive: true });
  }

  async update(id: string, updateData: Partial<IRole>): Promise<IRole | null> {
    return await Role.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });
  }

  async delete(id: string): Promise<IRole | null> {
    return await Role.findByIdAndDelete(id);
  }

  async exists(name: string): Promise<boolean> {
    const count = await Role.countDocuments({ name: name.toUpperCase() });
    return count > 0;
  }
}

export default new RoleRepository();
