import { AuthService } from '../../services/authService'
import { getAuthenticatedUser } from '../../utils/auth'
import { logApiRequest } from '../../utils/logger'

const authService = new AuthService()

export default defineEventHandler(async (event) => {
  const startTime = Date.now()

  try {
    const auth = getAuthenticatedUser(event)
    if (!auth) {
      throw createError({ statusCode: 401, statusMessage: 'Not authenticated' })
    }

    const user = await authService.getUserProfile(auth.userId)

    if (!user) {
      throw createError({ statusCode: 404, statusMessage: 'User not found' })
    }

    await logApiRequest({
      method: 'GET', path: event.path, statusCode: 200,
      durationMs: Date.now() - startTime, userId: auth.userId,
      ip: getRequestIP(event), userAgent: getHeader(event, 'user-agent')
    })

    return user
  } catch (error: any) {
    if (error.statusCode) throw error
    throw createError({ statusCode: 500, statusMessage: error.message })
  }
})


