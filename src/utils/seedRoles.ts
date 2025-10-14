import roleRepository from '../repositories/role.repository';

const defaultRoles = [
  {
    name: 'USER',
    description: 'Regular user with basic permissions',
    permissions: ['read:own_profile', 'update:own_profile'],
    isActive: true,
  },
  {
    name: 'ADMIN',
    description: 'Administrator with full system access',
    permissions: [
      'read:users',
      'create:users',
      'update:users',
      'delete:users',
      'read:roles',
      'create:roles',
      'update:roles',
      'delete:roles',
      'manage:all',
    ],
    isActive: true,
  },
];

export const seedRoles = async (): Promise<void> => {
  try {
    console.log('🌱 Seeding roles...');

    for (const roleData of defaultRoles) {
      const exists = await roleRepository.exists(roleData.name);

      if (!exists) {
        await roleRepository.create(roleData);
        console.log(`✅ Created role: ${roleData.name}`);
      } else {
        console.log(`⏭️  Role already exists: ${roleData.name}`);
      }
    }

    console.log('✅ Role seeding completed');
  } catch (error) {
    console.error('❌ Error seeding roles:', error);
    throw error;
  }
};
