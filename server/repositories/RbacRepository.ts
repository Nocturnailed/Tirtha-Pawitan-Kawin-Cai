import { db } from '../utils/database'
import { RoleName } from '@prisma/client'

export class RbacRepository {
    async findRoleByName(name: RoleName) {
        return await db.rbac_roles.findUnique({
            where: { name },
            include: { permissions: true }
        })
    }

    async findAllRoles() {
        return await db.rbac_roles.findMany({
            include: { permissions: true }
        })
    }

    async findPermissionsByRoleId(roleId: number) {
        return await db.rbac_role_permissions.findMany({
            where: { role_id: roleId }
        })
    }
}
