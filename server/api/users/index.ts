import { AuthService } from '../../services/authService'
import { getAuthenticatedUser } from '../../utils/auth'
import { checkPermission } from '../../utils/rbac'

const authService = new AuthService()

export default defineEventHandler(async (event) => {
    const method = event.node.req.method
    const auth = getAuthenticatedUser(event)

    if (!auth) {
        throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
    }

    // RBAC: Only ADMIN can manage users
    const isAdmin = await checkPermission({ userId: auth.userId, action: 'MANAGE', resource: 'USERS' })
    if (!isAdmin) {
        throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
    }

    if (method === 'GET') {
        return await authService.getAllUsers()
    }

    if (method === 'POST') {
        const body = await readBody(event)
        return await authService.createUser(body)
    }

    throw createError({ statusCode: 405, statusMessage: 'Method not allowed' })
})
