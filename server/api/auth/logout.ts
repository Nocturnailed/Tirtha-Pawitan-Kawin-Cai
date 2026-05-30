import { db } from '../../utils/database'
import { getAuthenticatedUser, extractBearerToken } from '../../utils/auth'
import { auditLog, logApiRequest } from '../../utils/logger'

export default defineEventHandler(async (event) => {
  const startTime = Date.now()

  try {
    const auth = getAuthenticatedUser(event)
    if (!auth) {
      throw createError({ statusCode: 401, statusMessage: 'Not authenticated' })
    }

    const token = extractBearerToken(event)
    if (token) {
      await db.from('auth_sessions').delete().eq('token', token)
    }

    await auditLog({
      userId: auth.userId,
      action: 'USER_LOGOUT',
      resource: 'auth_users',
      resourceId: auth.userId,
      ip: getRequestIP(event),
      userAgent: getHeader(event, 'user-agent'),
      details: `User logged out: ${auth.email}`
    })

    await logApiRequest({
      method: 'POST', path: event.path, statusCode: 200,
      durationMs: Date.now() - startTime, userId: auth.userId,
      ip: getRequestIP(event), userAgent: getHeader(event, 'user-agent')
    })

    return { success: true, message: 'Logged out successfully' }
  } catch (error: any) {
    await logApiRequest({
      method: 'POST', path: event.path,
      statusCode: error.statusCode || 500,
      durationMs: Date.now() - startTime,
      ip: getRequestIP(event), userAgent: getHeader(event, 'user-agent'),
      error: error.message
    })

    if (error.data || error.statusCode) throw error
    throw createError({ statusCode: 500, statusMessage: error.message })
  }
})
