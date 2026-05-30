import { AuthService } from '../../services/authService'
import { getAuthenticatedUser, verifyPassword } from '../../utils/auth'
import { db } from '../../utils/database'

const authService = new AuthService()

export default defineEventHandler(async (event) => {
    const auth = getAuthenticatedUser(event)
    if (!auth) throw createError({ statusCode: 401 })

    const body = await readBody(event)
    const { oldPassword, newPassword } = body

    if (!oldPassword || !newPassword) {
        throw createError({ statusCode: 400, statusMessage: 'Data tidak lengkap.' })
    }

    // Verify old password
    const user = await db.auth_users.findUnique({ where: { id: auth.userId } })
    if (!user) throw createError({ statusCode: 404 })

    const isValid = await verifyPassword(oldPassword, user.password)
    if (!isValid) {
        throw createError({ statusCode: 400, statusMessage: 'Password lama salah.' })
    }

    await authService.updatePassword(auth.userId, newPassword)
    return { message: 'Password berhasil diubah' }
})
