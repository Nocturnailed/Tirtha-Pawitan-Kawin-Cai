import { AuthService } from '../../services/authService'
import { getAuthenticatedUser } from '../../utils/auth'
import { checkPermission } from '../../utils/rbac'

const authService = new AuthService()

export default defineEventHandler(async (event) => {
    const auth = getAuthenticatedUser(event)
    if (!auth) throw createError({ statusCode: 401 })

    const isAdmin = await checkPermission({ userId: auth.userId, action: 'MANAGE', resource: 'USERS' })
    if (!isAdmin) throw createError({ statusCode: 403 })

    const body = await readBody(event)
    if (!body.userId || !body.newPassword) {
        throw createError({ statusCode: 400, statusMessage: 'Data tidak lengkap.' })
    }

    await authService.updatePassword(body.userId, body.newPassword)
    return { message: 'Password berhasil direset' }
})
