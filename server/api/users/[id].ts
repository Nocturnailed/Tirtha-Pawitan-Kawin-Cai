import { AuthService } from '../../services/authService'
import { getAuthenticatedUser } from '../../utils/auth'
import { checkPermission } from '../../utils/rbac'

const authService = new AuthService()

export default defineEventHandler(async (event) => {
    const method = event.node.req.method
    const id = parseInt(event.context.params?.id || '0', 10)
    const auth = getAuthenticatedUser(event)

    if (!auth) {
        throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
    }

    // RBAC: Only ADMIN can manage users
    const isAdmin = await checkPermission({ userId: auth.userId, action: 'MANAGE', resource: 'USERS' })
    if (!isAdmin) {
        throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
    }

    if (method === 'DELETE') {
        // Guard: Prevent deleting the last admin or self
        const userToDelete = await authService.getUserProfile(id)
        if (userToDelete?.role.name === 'ADMIN') {
            throw createError({ statusCode: 400, statusMessage: 'Akun Administrator tidak dapat dihapus demi keamanan sistem.' })
        }

        return await authService.deleteUser(id)
    }

    throw createError({ statusCode: 405, statusMessage: 'Method not allowed' })
})
