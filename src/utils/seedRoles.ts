import roleRepository from '../repositories/role.repository';

const defaultRoles = [
  {
    name: 'USER' as const,
    description: 'Regular user with basic permissions',
    permissions: ['read:own_profile', 'update:own_profile'],
  },
  {
    name: 'ADMIN' as const,
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
      'read:counselors',
      'create:counselors',
      'update:counselors',
      'delete:counselors',
      'manage:all',
    ],
  },
];

export const seedRoles = async (): Promise<void> => {
  try {
    console.log('🌱 Checking roles...');

    // Check if all required roles exist
    const allExist = await Promise.all(
      defaultRoles.map(role => roleRepository.exists(role.name))
    );

    // If all roles exist, skip seeding
    if (allExist.every(exists => exists)) {
      console.log('✅ All roles already exist, skipping seed');
      return;
    }

    console.log('📝 Seeding missing roles...');

    for (const roleData of defaultRoles) {
      try {
        const existingRole = await roleRepository.findByName(roleData.name);

        if (!existingRole) {
          await roleRepository.create(roleData);
          console.log(`✅ Created role: ${roleData.name}`);
        } else {
          console.log(`⏭️  Role already exists: ${roleData.name} (ID: ${existingRole._id})`);
        }
      } catch (error) {
        console.error(`❌ Error processing role ${roleData.name}:`, error);
        // Continue with other roles even if one fails
      }
    }

    console.log('✅ Role seeding completed');
  } catch (error) {
    console.error('❌ Error seeding roles:', error);
    throw error;
  }
};
