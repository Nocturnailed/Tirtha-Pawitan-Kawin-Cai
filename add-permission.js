import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
    const adminRole = await prisma.rbac_roles.findUnique({ where: { name: 'ADMIN' } })
    if (adminRole) {
        await prisma.rbac_role_permissions.upsert({
            where: {
                role_id_action_resource: {
                    role_id: adminRole.id,
                    action: 'MANAGE',
                    resource: 'SETTINGS'
                }
            },
            update: {},
            create: {
                role_id: adminRole.id,
                action: 'MANAGE',
                resource: 'SETTINGS'
            }
        })
        console.log('Permission MANAGE SETTINGS added to ADMIN')
    }
}

main().finally(() => prisma.$disconnect())
