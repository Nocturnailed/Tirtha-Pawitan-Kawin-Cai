const { PrismaClient } = require('@prisma/client')
const { pbkdf2Sync, randomBytes } = require('crypto')

const prisma = new PrismaClient()

// Must match server/utils/auth.ts exactly
const SALT_LEN = 16
const KEY_LEN = 64
const ITERATIONS = 100000

function hashPassword(password) {
    const salt = randomBytes(SALT_LEN).toString('hex')
    const key = pbkdf2Sync(password, salt, ITERATIONS, KEY_LEN, 'sha512').toString('hex')
    return `pbkdf2$${ITERATIONS}$${salt}$${key}`
}

async function main() {
    console.log('🌱 Seeding database...')

    // 1. Create Roles
    const adminRole = await prisma.rbac_roles.upsert({
        where: { name: 'ADMIN' },
        update: {},
        create: { name: 'ADMIN', description: 'Full system administrator' }
    })

    const petugasRole = await prisma.rbac_roles.upsert({
        where: { name: 'PETUGAS' },
        update: {},
        create: { name: 'PETUGAS', description: 'Field officer / petugas lapangan' }
    })

    const penelitiRole = await prisma.rbac_roles.upsert({
        where: { name: 'PENELITI' },
        update: {},
        create: { name: 'PENELITI', description: 'Research team member' }
    })

    const viewerRole = await prisma.rbac_roles.upsert({
        where: { name: 'VIEWER' },
        update: {},
        create: { name: 'VIEWER', description: 'Public viewer / read-only' }
    })

    console.log('✅ Roles created')

    // 2. Create Permissions
    const permissions = [
        // Admin gets everything
        { role_id: adminRole.id, action: 'CREATE', resource: 'WATER_POINTS' },
        { role_id: adminRole.id, action: 'READ', resource: 'WATER_POINTS' },
        { role_id: adminRole.id, action: 'UPDATE', resource: 'WATER_POINTS' },
        { role_id: adminRole.id, action: 'DELETE', resource: 'WATER_POINTS' },
        { role_id: adminRole.id, action: 'MANAGE', resource: 'USERS' },
        { role_id: adminRole.id, action: 'MANAGE', resource: 'LOGS' },
        // Petugas
        { role_id: petugasRole.id, action: 'CREATE', resource: 'WATER_POINTS' },
        { role_id: petugasRole.id, action: 'READ', resource: 'WATER_POINTS' },
        { role_id: petugasRole.id, action: 'UPDATE', resource: 'WATER_POINTS' },
        // Peneliti
        { role_id: penelitiRole.id, action: 'READ', resource: 'WATER_POINTS' },
        // Viewer
        { role_id: viewerRole.id, action: 'READ', resource: 'WATER_POINTS' },
    ]

    for (const p of permissions) {
        await prisma.rbac_role_permissions.upsert({
            where: { role_id_action_resource: { role_id: p.role_id, action: p.action, resource: p.resource } },
            update: {},
            create: p
        })
    }
    console.log('✅ Permissions created')

    // 3. Create Admin User (PBKDF2 hash)
    const adminPassword = hashPassword('admin123')
    console.log('🔑 Admin password hash generated (PBKDF2)')

    await prisma.auth_users.upsert({
        where: { email: 'admin@tirtha.id' },
        update: { password: adminPassword },
        create: {
            email: 'admin@tirtha.id',
            password: adminPassword,
            full_name: 'Administrator',
            institution: 'Universitas Teknologi Bandung',
            position: 'System Admin',
            role_id: adminRole.id,
            status: 'ACTIVE'
        }
    })
    console.log('✅ Admin user created (admin@tirtha.id / admin123)')

    // 4. Create Petugas User
    const petugasPassword = hashPassword('petugas123')
    await prisma.auth_users.upsert({
        where: { email: 'petugas@tirtha.id' },
        update: { password: petugasPassword },
        create: {
            email: 'petugas@tirtha.id',
            password: petugasPassword,
            full_name: 'Petugas Lapangan',
            institution: 'Dinas Lingkungan Hidup Kuningan',
            position: 'Petugas Lapangan',
            role_id: petugasRole.id,
            status: 'ACTIVE'
        }
    })
    console.log('✅ Petugas user created (petugas@tirtha.id / petugas123)')

    // 5. Seed Water Points
    const waterPoints = [
        { name: 'Mata Air Cibulan', district: 'Cigugur', lat: -6.9667, lng: 108.4833, debit: 25.5, status: 'Layak/Aman', topic: 'tirtha/cibulan', description: 'Sumber mata air utama wisata Cibulan' },
        { name: 'Mata Air Cigugur', district: 'Cigugur', lat: -6.9750, lng: 108.4700, debit: 18.3, status: 'Layak/Aman', topic: 'tirtha/cigugur', description: 'Sumber air bersih warga Cigugur' },
        { name: 'Mata Air Darmaloka', district: 'Kadugede', lat: -7.0100, lng: 108.5200, debit: 12.1, status: 'Butuh Konservasi', topic: 'tirtha/darmaloka', description: 'Titik air kritis di Kadugede' },
        { name: 'Mata Air Sangkanhurip', district: 'Kuningan', lat: -6.9800, lng: 108.4850, debit: 30.7, status: 'Layak/Aman', topic: 'tirtha/sangkanhurip', description: 'Sumber air terbesar wilayah kota' },
        { name: 'Mata Air Cipaniis', district: 'Pasawahan', lat: -7.0200, lng: 108.4500, debit: 8.5, status: 'Kritis', topic: 'tirtha/cipaniis', description: 'Debit menurun signifikan, perlu intervensi' },
    ]

    for (const wp of waterPoints) {
        await prisma.wp_water_points.upsert({
            where: { name: wp.name },
            update: {},
            create: wp
        })
    }
    console.log('✅ Water points seeded')

    // 6. Insert initial audit log
    const adminUser = await prisma.auth_users.findUnique({ where: { email: 'admin@tirtha.id' } })
    if (adminUser) {
        await prisma.log_audit_trail.create({
            data: {
                user_id: adminUser.id,
                action: 'SEED',
                resource: 'SYSTEM',
                details: 'Initial database seed completed'
            }
        })
    }
    console.log('✅ Audit log seeded')

    console.log('\n🎉 Seeding complete!')
}

main()
    .catch(e => {
        console.error('❌ Seed failed:', e)
        process.exit(1)
    })
    .finally(() => prisma.$disconnect())
