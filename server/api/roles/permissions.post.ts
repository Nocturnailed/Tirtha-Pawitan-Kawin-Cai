import { getAuthenticatedUser } from '../../utils/auth'
import { checkPermission } from '../../utils/rbac'
import { db } from '../../utils/database'

export default defineEventHandler(async (event) => {
    const auth = getAuthenticatedUser(event)
    if (!auth) throw createError({ statusCode: 401 })

    const isAdmin = await checkPermission({ userId: auth.userId, action: 'MANAGE', resource: 'ROLES' })
    if (!isAdmin) throw createError({ statusCode: 403 })

    const body = await readBody(event)
    const { roleId, permissions } = body

    if (!roleId || !Array.isArray(permissions)) {
        throw createError({ statusCode: 400, statusMessage: 'Data tidak lengkap.' })
    }

    // Guard: Prevent editing the ADMIN role (roleId 1)
    if (roleId === 1) {
        throw createError({ statusCode: 403, statusMessage: 'Izin Peran Administrator bersifat tetap dan tidak dapat diubah.' })
    }

    // Bulk update permissions
    await db.$transaction([
        db.rbac_role_permissions.deleteMany({ where: { role_id: roleId } }),
        db.rbac_role_permissions.createMany({
            data: permissions.map(p => ({
                role_id: roleId,
                action: p.action,
                resource: p.resource
            }))
        })
    ])

    return { message: 'Izin peran berhasil diperbarui' }
})
