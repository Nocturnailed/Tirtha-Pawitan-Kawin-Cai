import { db } from '../../utils/database'
import { getAuthenticatedUser } from '../../utils/auth'
import { checkPermission } from '../../utils/rbac'
import { logApiRequest } from '../../utils/logger'

export default defineEventHandler(async (event) => {
  const startTime = Date.now()

  try {
    const auth = getAuthenticatedUser(event)
    if (!auth) {
      throw createError({ statusCode: 401, statusMessage: 'Authentication required' })
    }

    const hasPermission = await checkPermission({
      userId: auth.userId, action: 'VIEW_LOGS', resource: 'LOGS'
    })
    if (!hasPermission) {
      throw createError({ statusCode: 403, statusMessage: 'Insufficient permissions: VIEW_LOGS' })
    }

    const query = getQuery(event)
    const page = parseInt(query.page as string) || 1
    const limit = parseInt(query.limit as string) || 20
    const pathFilter = query.path as string
    const methodFilter = query.method as string

    let dbQuery = db.from('log_api_requests')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1)

    if (pathFilter) dbQuery = dbQuery.ilike('path', `%${pathFilter}%`)
    if (methodFilter) dbQuery = dbQuery.eq('method', methodFilter)

    const { data: logs, count, error: fetchError } = await dbQuery
    if (fetchError) throw new Error(fetchError.message)

    await logApiRequest({
      method: 'GET', path: event.path, statusCode: 200,
      durationMs: Date.now() - startTime, userId: auth.userId,
      ip: getRequestIP(event), userAgent: getHeader(event, 'user-agent')
    })

    return {
      data: logs,
      pagination: { page, limit, total: count || 0, totalPages: Math.ceil((count || 0) / limit) }
    }
  } catch (error: any) {
    await logApiRequest({
      method: 'GET', path: event.path,
      statusCode: error.statusCode || 500,
      durationMs: Date.now() - startTime,
      ip: getRequestIP(event), userAgent: getHeader(event, 'user-agent'),
      error: error.message
    })

    if (error.data || error.statusCode) throw error
    throw createError({ statusCode: 500, statusMessage: error.message })
  }
})
